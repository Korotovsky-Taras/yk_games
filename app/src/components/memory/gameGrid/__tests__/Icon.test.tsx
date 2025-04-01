import { render } from '@testing-library/react';

import { Icon } from '../Icon';

describe('Icon', () => {
  beforeAll(() => {
     
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    vi.mocked(console.error).mockRestore();
  });

  it('Should throw when an invalid iconId is passed', () => {
    expect(() => render(<Icon iconId="invalid id" />)).toThrow();
  });
});
