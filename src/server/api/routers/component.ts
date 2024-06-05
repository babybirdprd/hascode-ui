import { ComponentVisibility } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  generateNewComponent,
  generateNewComponentClaude,
  reviseComponent,
  reviseComponentClaude,
} from "~/server/openai";

export const componentRouter = createTRPCRouter({
  createComponent: publicProcedure
    .input(
      z.object({
        prompt: z.string(),
        model: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prompt, model } = input;
      let result = "";

      if (prompt === "") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Prompt cannot be empty",
        });
      }

      if (model === "claude") {
        result = await generateNewComponentClaude(prompt);
      } else {
        result = await generateNewComponent(prompt);
      }

      const component = await ctx.db.component.create({
        data: {
          code: result,
          prompt,
          revisions: {
            create: {
              code: result,
              prompt,
            },
          },
        },
      });

      if (!component) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not create component",
        });
      }

      return {
        status: "success",
        data: {
          componentId: component.id,
        },
      };
    }),
  makeRevision: publicProcedure
    .input(
      z.object({
        revisionId: z.string(),
        prompt: z.string(),
        model: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { revisionId, prompt, model } = input;
      let result = "";

      const baseRevision = await ctx.db.componentRevision.findFirst({
        where: {
          id: revisionId,
        },
      });

      if (!baseRevision) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No component found",
        });
      }

      if (model === "claude") {
        result = await reviseComponentClaude(prompt, baseRevision.code);
      } else {
        result = await reviseComponent(prompt, baseRevision.code);
      }

      const newRevision = await ctx.db.componentRevision.create({
        data: {
          code: result,
          prompt,
          componentId: baseRevision.componentId,
        },
      });

      const updatedComponent = await ctx.db.component.update({
        where: {
          id: baseRevision.componentId,
        },
        data: {
          code: result,
          prompt,
          revisions: {
            connect: {
              id: newRevision.id,
            },
          },
        },
      });

      if (!newRevision || !updatedComponent) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not create revision",
        });
      }

      return {
        status: "success",
        data: {
          revisionId: newRevision.id,
        },
      };
    }),
  forkRevision: publicProcedure
    .input(
      z.object({
        revisionId: z.string(),
        includePrevious: z.boolean().default(false).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { revisionId, includePrevious } = input;

      const component = await ctx.db.component.findFirst({
        where: {
          revisions: {
            some: {
              id: revisionId,
            },
          },
        },
        include: {
          revisions: true,
        },
      });

      const revisionIndex = component?.revisions.findIndex(
        (rev) => rev.id === revisionId
      );
      if (!component || revisionIndex === undefined) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No revision found",
        });
      }

      const revisions = (
        includePrevious
          ? component.revisions.slice(0, revisionIndex)
          : [component.revisions[revisionIndex]]
      )
        .filter(function <T>(rev: T): rev is NonNullable<T> {
          return rev !== undefined;
        })
        .map(({ code, prompt }) => ({ code, prompt }));

      if (revisions.length < 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No revision found",
        });
      }

      const newComponent = await ctx.db.component.create({
        data: {
          code: revisions[0]!.code,
          prompt: revisions[0]!.prompt,
          revisions: {
            create: revisions,
          },
        },
        include: {
          revisions: true,
        },
      });

      if (!newComponent) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not create component",
        });
      }

      return {
        status: "success",
        data: {
          revisionId: newComponent.revisions[0]!.id,
        },
      };
    }),
  getComponent: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const component = await ctx.db.component.findFirst({
        where: {
          id: input,
        },
        include: {
          revisions: true,
        },
      });

      if (component) {
        // Since auth is removed, we don't compare the authorId anymore
        return component;
      }

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No component found",
      });
    }),
  getComponentFromRevision: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const component = await ctx.db.component.findFirst({
        where: {
          revisions: {
            some: {
              id: input,
            },
          },
        },
        include: {
          revisions: true,
        },
      });

      if (component) {
        // Since auth is removed, we don't compare the authorId anymore
        return component;
      }

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No component found",
      });
    }),
  getMyComponents: publicProcedure
    .input(
      z.object({
        pageIndex: z.number().default(0),
        pageSize: z.number().default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const componentCount = await ctx.db.component.count();

      const components = await ctx.db.component.findMany({
        include: {
          revisions: true,
        },
        take: input.pageSize,
        skip: input.pageSize * input.pageIndex,
        orderBy: {
          createdAt: "desc",
        },
      });

      return {
        status: "success",
        data: {
          rows: components,
          pageCount: Math.ceil(componentCount / input.pageSize),
        },
      };
    }),
});

/**
 * componentImportRouter allows to create a component from arbitrary code blocks.
 * In most cases this would be a priviledged endpoint that only admins can use.
 *
 * @todo Expose this via API (public or private TBD)
 * and perhaps implement ad-hoc procedure rather than use protectedProcedure.
 */
export const componentImportRouter = createTRPCRouter({
  importComponent: publicProcedure
    .input(
      z.object({
        /* @todo set max length ? */
        code: z.string(),
        description: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { code, description } = input;

      // @todo validate code
      if (!code /* || !isValid(code) */) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid code snippet",
        });
      }

      const component = await ctx.db.component.create({
        data: {
          code,
          prompt: description,
          revisions: {
            create: {
              code,
              prompt: description,
            },
          },
        },
      });

      if (!component) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not create component",
        });
      }

      return {
        status: "success",
        data: {
          componentId: component.id,
        },
      };
    }),
});
