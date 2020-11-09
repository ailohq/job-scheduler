import { JobScheduler } from "./JobScheduler";

let scheduler: JobScheduler | undefined;

afterEach(() => {
  scheduler?.destroy();
});

describe("JobScheduler", () => {
  it("schedules job and runs it when needed", () => {
    jest.useFakeTimers();

    const jobFn = jest.fn();

    scheduler = new JobScheduler({
      jobs: [
        {
          name: "bar",
          cronSchedule: "* * * * * *",
          onExecute() {
            jobFn();
          },
        },
      ],
    });
    jest.runOnlyPendingTimers();

    expect(jobFn).toBeCalledTimes(1);
  });
});
