// setup.js
export const describe = (name, fn) => {
  console.log(name);
  fn();
};

export const it = (name, fn) => {
  console.log('  ', name);
  fn();
};

export const expect = (actual) => ({
  toBeDefined: () => {
    if (actual === undefined) {
      throw new Error('Expected value to be defined, but it was undefined');
    }
  },
  toEqual: (expected) => {
    if (actual !== expected) {
      throw new Error(`Expected ${actual} to equal ${expected}`);
    }
  },
  toStrictEqual: (expected) => {
    if (actual !== expected) {
      throw new Error(`Expected ${actual} to strictly equal ${expected}`);
    }
  },
  rejects: {
    toThrow: async (message) => {
      try {
        await actual();
      } catch (e) {
        if (e.message !== message) {
          throw new Error(`Expected error message "${message}", but got "${e.message}"`);
        }
        return;
      }
      throw new Error('Expected promise to reject, but it resolved');
    },
  },
  resolves: async (expected) => {
    const actualValue = await actual;
    if (actualValue !== expected) {
      throw new Error(`Expected promise to resolve with ${expected}, but it resolved with ${actualValue}`);
    }
  },
});

export const beforeAll = async (fn) => {
  await fn();
};

export const beforeEach = async (fn) => {
  await fn();
};

export const afterAll = async (fn) => {
  await fn();
};
