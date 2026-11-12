import { Queue } from "bullmq";

const connection = {
  host: "localhost",
  post: 6379,
};

const emailQueue = new Queue("emails", { connection });

module.exports = {
  emailQueue,
  connection,
};
