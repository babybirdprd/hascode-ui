import { type ReactElement } from "react";
import { ApplicationLayout } from "~/components/AppLayout";
import { Button } from "~/components/Button";
import { type NextPageWithLayout } from "./_app";

const SettingsPage: NextPageWithLayout = () => {
  return (
    <div className="h-full bg-neutral-100 py-10">
      <header>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
            Settings
          </h1>
        </div>
      </header>
      <main>
        <div className="mx-auto mt-6 flex max-w-7xl flex-col gap-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow sm:rounded-lg">
            <div className="px-4 py-6 sm:px-6">
              <h3 className="text-base font-semibold leading-7 text-gray-900">
                Personal Settings
              </h3>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
                Placeholder for personal details and settings.
              </p>
            </div>
          </div>
          <div className="mb-4 overflow-hidden bg-white shadow sm:rounded-lg">
            <div className="px-4 py-6 sm:px-6">
              <h3 className="text-base font-semibold leading-7 text-gray-900">
                Account Settings
              </h3>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
                Placeholder for account details and settings.
              </p>
            </div>
            <div className="border-t border-gray-100">
              <dl className="divide-y divide-gray-100">
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-900">
                    Delete Account
                  </dt>
                  <dd className="mt-1 flex text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                    <div className="grow">
                      No longer want to use our service? This action is not
                      reversible. All information related to this account will
                      be deleted permanently.
                    </div>
                    <div className="flex basis-2/6 items-start justify-end">
                      <Button
                        variant="white"
                        size="normal"
                        onClick={() => {
                          // Handle account deletion logic
                        }}
                      >
                        Delete my account
                      </Button>
                    </div>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

SettingsPage.getLayout = (page: ReactElement) => (
  <ApplicationLayout title="Settings">{page}</ApplicationLayout>
);

export default SettingsPage;
