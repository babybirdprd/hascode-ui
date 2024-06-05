import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { CustomToaster } from "~/components/CustomToaster";
import { cn } from "~/utils/utils";

const navigation = [{ name: "My UIs", href: "/my-uis" }];
const PageNames = ["My UIs"];

interface ApplicationLayoutProps {
  page?: (typeof PageNames)[number];
  title?: string;
  children?: React.ReactNode;
}

export const ApplicationLayout = ({
  page,
  title,
  children,
}: ApplicationLayoutProps) => {
  return (
    <>
      {title && (
        <Head>
          <title>{title}</title>
        </Head>
      )}
      <Disclosure as="nav" className="border-b border-gray-200 bg-white">
        {({ open }) => (
          <>
            <div className="mx-auto px-8">
              <div className="flex h-16 justify-between">
                <div className="flex">
                  <Link
                    href="https://lutfiikbalmajid.netlify.app/"
                    target="_blank"
                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  >
                    <Image
                      width={40}
                      height={40}
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/cf51d4614b9df3de0b1afa110d29f9e9e58cabc5721e8169aaf817138c300f87?apiKey=b4b8e1120d4040cb8e27288270221f30&width=2000"
                      alt="HasCode UI"
                      className="h-8 w-auto"
                    />
                    <p className=" text-xl font-bold text-gray-700">
                      HasCode UI
                    </p>
                  </Link>
                  <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          item.name === page
                            ? "border-indigo-500 text-gray-900"
                            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                          "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium",
                        )}
                        aria-current={item.name === page ? "page" : undefined}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="-mr-2 flex items-center sm:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon
                        className="block h-6 w-6"
                        aria-hidden="true"
                      />
                    ) : (
                      <Bars3Icon
                        className="block h-6 w-6"
                        aria-hidden="true"
                      />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>
            <Disclosure.Panel className="sm:hidden">
              <div className="space-y-1 pb-3 pt-2">
                {navigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as="a"
                    href={item.href}
                    className={cn(
                      item.name === page
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800",
                      "block border-l-4 py-2 pl-3 pr-4 text-base font-medium",
                    )}
                    aria-current={item.name === page ? "page" : undefined}
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      <main className="h-[calc(100vh-65px)]">{children}</main>
      <CustomToaster
        position="bottom-right"
        reverseOrder={false}
        toastOptions={{ duration: 5000 }}
      />
    </>
  );
};

