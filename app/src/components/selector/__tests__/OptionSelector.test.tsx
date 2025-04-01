import { fireEvent, render, screen } from '@testing-library/react';

import { Selector } from '../';

describe('Selector', () => {
  it('Should handle changes correctly', async () => {
    const onChange = vi.fn();
    const options = ['1', '2', '3', '4'];

    render(<Selector name="number-of-players" options={options} value={options[0]} onChange={onChange} groupAriaLabel="Select number of players" />);

    const option2Btn = await screen.findByText(options[1]);
    fireEvent.click(option2Btn);

    expect(onChange).toHaveBeenCalledWith(options[1]);
  });
});
