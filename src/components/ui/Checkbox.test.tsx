import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from './Checkbox';
import type { CheckboxProps } from './Checkbox';

describe('Checkbox', () => {
  const defaultProps: CheckboxProps = {
    id: 'test-checkbox',
    label: 'Test Checkbox',
    checked: false,
    onChange: vi.fn(),
  };

  describe('Rendering', () => {
    it('should render checkbox with label', () => {
      render(<Checkbox {...defaultProps} />);
      
      const checkbox = screen.getByRole('checkbox', { name: /test checkbox/i });
      const label = screen.getByText('Test Checkbox');
      
      expect(checkbox).toBeInTheDocument();
      expect(label).toBeInTheDocument();
    });

    it('should render in checked state', () => {
      render(<Checkbox {...defaultProps} checked={true} />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('should render in unchecked state', () => {
      render(<Checkbox {...defaultProps} checked={false} />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('should render with custom className', () => {
      render(<Checkbox {...defaultProps} className="custom-class" />);
      
      const container = screen.getByTestId('checkbox-container');
      expect(container).toHaveClass('custom-class');
    });

    it('should render in disabled state', () => {
      render(<Checkbox {...defaultProps} disabled={true} />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
    });

    it('should render with color indicator', () => {
      render(<Checkbox {...defaultProps} color="#FFB800" />);
      
      const colorIndicator = screen.getByTestId('checkbox-color-indicator');
      expect(colorIndicator).toHaveStyle({ backgroundColor: '#FFB800' });
    });

    it('should render with icon', () => {
      render(<Checkbox {...defaultProps} icon="🍽️" />);
      
      const icon = screen.getByTestId('checkbox-icon');
      expect(icon).toHaveTextContent('🍽️');
    });

    it('should render with badge count', () => {
      render(<Checkbox {...defaultProps} badge={5} />);
      
      const badge = screen.getByTestId('checkbox-badge');
      expect(badge).toHaveTextContent('5');
    });

    it('should not render badge when count is 0', () => {
      render(<Checkbox {...defaultProps} badge={0} />);
      
      const badge = screen.queryByTestId('checkbox-badge');
      expect(badge).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onChange when clicked', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      render(<Checkbox {...defaultProps} onChange={onChange} />);
      
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('should toggle checked state', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      render(<Checkbox {...defaultProps} checked={true} onChange={onChange} />);
      
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      
      expect(onChange).toHaveBeenCalledWith(false);
    });

    it('should not call onChange when disabled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      render(<Checkbox {...defaultProps} disabled={true} onChange={onChange} />);
      
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should handle label click', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      render(<Checkbox {...defaultProps} onChange={onChange} />);
      
      const label = screen.getByText('Test Checkbox');
      await user.click(label);
      
      expect(onChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<Checkbox {...defaultProps} />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('id', 'test-checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
    });

    it('should have aria-checked true when checked', () => {
      render(<Checkbox {...defaultProps} checked={true} />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });

    it('should have aria-disabled when disabled', () => {
      render(<Checkbox {...defaultProps} disabled={true} />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-disabled', 'true');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      render(<Checkbox {...defaultProps} onChange={onChange} />);
      
      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();
      expect(checkbox).toHaveFocus();
      
      await user.keyboard(' ');
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('should have proper label association', () => {
      render(<Checkbox {...defaultProps} />);
      
      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByLabelText('Test Checkbox');
      
      expect(label).toHaveAttribute('id', 'test-checkbox');
      expect(checkbox).toHaveAttribute('id', 'test-checkbox');
    });
  });

  describe('Visual States', () => {
    it('should show focus state', async () => {
      render(<Checkbox {...defaultProps} />);
      
      const checkbox = screen.getByRole('checkbox');
      const container = screen.getByTestId('checkbox-container');
      
      await act(async () => {
        checkbox.focus();
      });
      
      await waitFor(() => {
        // The focused class is applied to the container when checkbox has focus
        expect(container.className).toContain('focused');
      });
    });

    it('should show hover state', async () => {
      const user = userEvent.setup();
      render(<Checkbox {...defaultProps} />);
      
      const container = screen.getByTestId('checkbox-container');
      await user.hover(container);
      
      expect(container).toHaveClass('hover');
    });

    it('should show disabled visual state', () => {
      render(<Checkbox {...defaultProps} disabled={true} />);
      
      const container = screen.getByTestId('checkbox-container');
      expect(container).toHaveClass('disabled');
    });

    it('should show indeterminate state', () => {
      render(<Checkbox {...defaultProps} indeterminate={true} />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
    });
  });
});