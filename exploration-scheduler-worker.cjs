const { ExplorationStore } = require('./exploration-store.cjs');
const { createExplorationExecutor } = require('./exploration-runtime.cjs');
const { startCoordinator } = require('./exploration-scheduler.cjs');

const store = new ExplorationStore();
const execute = createExplorationExecutor({ store });
const coordinator = startCoordinator({ store, execute });

function stop() {
  coordinator.stop();
  process.exit(0);
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
