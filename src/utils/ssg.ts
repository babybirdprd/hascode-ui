import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";

import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import type { GetServerSidePropsContext } from "next";

export const ssgHelper = async (context: GetServerSidePropsContext) => {
  const ctx = createInnerTRPCContext({ session: null });

  const ssg = createServerSideHelpers({
    ctx,
    router: appRouter,
    transformer: superjson,
  });

  return {
    ssg,
    session: null,
  };
};
