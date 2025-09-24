describe('Simple Test Setup', () => {
  test('Jest is working correctly', () => {
    expect(1 + 1).toBe(2);
    console.log('✅ Jest is working!');
  });

  test('Environment variables are set', () => {
    expect(process.env.NODE_ENV).toBe('test');
    console.log('✅ Environment variables are set correctly');
  });

  test('Basic TypeScript compilation', () => {
    interface TestInterface {
      name: string;
      value: number;
    }

    const testObj: TestInterface = {
      name: 'test',
      value: 42
    };

    expect(testObj.name).toBe('test');
    expect(testObj.value).toBe(42);
    console.log('✅ TypeScript compilation works');
  });
});