import cron from "node-cron";
import { Monitoring, Transaction, TransactionStatus } from "@ailo/monitoring";
import { LoggerInterface } from "./LoggerInterface";

export { LoggerInterface };

export interface JobOptions {
  /**
   * @example "DeleteExpiredUserEmailVerifications"
   */
  name: string;

  /**
   * @example "0 0 3 * *" (3am every day)
   * @see https://github.com/node-cron/node-cron#cron-syntax
   */
  cronSchedule: string;

  onExecute: () => void;
}

export class JobScheduler {
  private cronTasks: cron.ScheduledTask[] = [];

  private logger?: LoggerInterface;

  private monitoring?: Monitoring;

  constructor({
    jobs: jobsOptions,
    logger,
    monitoring,
  }: {
    jobs: JobOptions[];
    logger?: LoggerInterface;
    monitoring?: Monitoring;
  }) {
    this.logger = logger;
    this.monitoring = monitoring;

    jobsOptions.forEach((jobOptions) => {
      this.schedule(jobOptions);
    });
  }

  destroy() {
    this.cronTasks.forEach((cronTask) => {
      cronTask.destroy();
    });
    this.cronTasks.length = 0;
  }

  private schedule({ name, cronSchedule, onExecute }: JobOptions): void {
    if (!cron.validate(cronSchedule)) {
      throw new TypeError(
        `Invalid cronSchedule "${cronSchedule}" (job.name="${name}")`
      );
    }

    const cronTask = cron.schedule(
      cronSchedule,
      () => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.runJob(name, onExecute);
      },
      {
        timezone: "Australia/Sydney",
      }
    );

    this.cronTasks.push(cronTask);
  }

  private runJob(
    name: string,
    jobFn: () => void | Promise<void>
  ): void | Promise<void> {
    const startTime = Date.now();
    this.logger?.info(`JOB START ${name}`);

    const handleTransaction = async (transaction?: Transaction) => {
      try {
        await jobFn();

        transaction?.setStatus(TransactionStatus.Ok);

        const duration = Date.now() - startTime;
        this.logger?.info(`JOB END ${name} - status=ok duration=${duration}`);
      } catch (error) {
        transaction?.setStatus(TransactionStatus.InternalError);

        this.logger?.warn(`JOB END ${name} - status=error error=${error}`);
      }
    };

    if (!this.monitoring) {
      return handleTransaction();
    }

    return this.monitoring.runInTransaction(
      {
        name,
        op: "job.perform",
      },
      handleTransaction
    );
  }
}
