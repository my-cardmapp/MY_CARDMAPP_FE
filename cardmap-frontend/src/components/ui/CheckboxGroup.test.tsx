import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckboxGroup } from './CheckboxGroup';
import type { CheckboxGroupProps, CheckboxOption } from './CheckboxGroup';

describe('CheckboxGroup', () => {
  const mockOptions: CheckboxOption[] = [
    { id: 'option1', label: 'Option 1', value: 'value1' },
    { id: 'option2', label: 'Option 2', value: 'value2' },
    { id: 'option3', label: 'Option 3', value: 'value3' },
  ];

  const defaultProps: CheckboxGroupProps = {
    title: 'Test Group',
    options: mockOptions,
    selectedValues: [],
    onChange: vi.fn(),
  };

  describe('Rendering', () => {
    it('should render group title', () => {
      render(<CheckboxGroup {...defaultProps} />);
      
      expect(screen.getByText('Test Group')).toBeInTheDocument();
    });

    it('should render all options', () => {
      render(<CheckboxGroup {...defaultProps} />);
      
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('should render with selected values', () => {
      render(
        <CheckboxGroup 
          {...defaultProps} 
          selectedValues={['value1', 'value3']} 
        />
      );
      
      const checkbox1 = screen.getByRole('checkbox', { name: /option 1/i });
      const checkbox2 = screen.getByRole('checkbox', { name: /option 2/i });
      const checkbox3 = screen.getByRole('checkbox', { name: /option 3/i });
      
      expect(checkbox1).toBeChecked();
      expect(checkbox2).not.toBeChecked();
      expect(checkbox3).toBeChecked();
    });

    it('should render with custom className', () => {
      render(<CheckboxGroup {...defaultProps} className="custom-group" />);
      
      const group = screen.getByTestId('checkbox-group');
      expect(group).toHaveClass('custom-group');
    });

    it('should render options with colors', () => {
      const optionsWithColors: CheckboxOption[] = [
        { id: 'opt1', label: 'Option 1', value: 'val1', color: '#FF0000' },
        { id: 'opt2', label: 'Option 2', value: 'val2', color: '#00FF00' },
      ];
      
      render(
        <CheckboxGroup 
          {...defaultProps} 
          options={optionsWithColors} 
        />
      );
      
      const colorIndicators = screen.getAllByTestId('checkbox-color-indicator');
      expect(colorIndicators[0]).toHaveStyle({ backgroundColor: '#FF0000' });
      expect(colorIndicators[1]).toHaveStyle({ backgroundColor: '#00FF00' });
    });

    it('should render options with icons', () => {
      const optionsWithIcons: CheckboxOption[] = [
        { id: 'opt1', label: 'Option 1', value: 'val1', icon: '🍕' },
        { id: 'opt2', label: 'Option 2', value: 'val2', icon: '🍔' },
      ];
      
      render(
        <CheckboxGroup 
          {...defaultProps} 
          options={optionsWithIcons} 
        />
      );
      
      expect(screen.getByText('🍕')).toBeInTheDocument();
      expect(screen.getByText('🍔')).toBeInTheDocument();
    });

    it('should show badge with selected count', () => {
      render(
        <CheckboxGroup 
          {...defaultProps} 
          selectedValues={['value1', 'value2']}
          showBadge={true}
        />
      );
      
      const badge = screen.getByTestId('group-badge');
      expect(badge).toHaveTextContent('2');
    });
  });

  describe('Select All Functionality', () => {
    it('should render select all button when enabled', () => {
      render(<CheckboxGroup {...defaultProps} showSelectAll={true} />);
      
      expect(screen.getByText('전체 선택')).toBeInTheDocument();
    });

    it('should select all options when select all is clicked', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      render(
        <CheckboxGroup 
          {...defaultProps} 
          onChange={onChange}
          showSelectAll={true}
        />
      );
      
      const selectAllButton = screen.getByText('전체 선택');
      await user.click(selectAllButton);
      
      expect(onChange).toHaveBeenCalledWith(['value1', 'value2', 'value3']);
    });

    it('should show "전체 해제" when all options are selected', () => {
      render(
        <CheckboxGroup 
          {...defaultProps} 
          selectedValues={['value1', 'value2', 'value3']}
          showSelectAll={true}
        />
      );
      
      expect(screen.getByText('전체 해제')).toBeInTheDocument();
      expect(screen.queryByText('전체 선택')).not.toBeInTheDocument();
    });

    it('should clear all selections when deselect all is clicked', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      render(
        <CheckboxGroup 
          {...defaultProps} 
          selectedValues={['value1', 'value2', 'value3']}
          onChange={onChange}
          showSelectAll={true}
        />
      );
      
      const deselectAllButton = screen.getByText('전체 해제');
      await user.click(deselectAllButton);
      
      expect(onChange).toHaveBeenCalledWith([]);
    });

    it('should show indeterminate state when some options are selected', () => {
      render(
        <CheckboxGroup 
          {...defaultProps} 
          selectedValues={['value1', 'value2']}
          showSelectAll={true}
        />
      );
      
      const selectAllCheckbox = screen.getByTestId('select-all-checkbox');
      expect(selectAllCheckbox).toHaveAttribute('aria-checked', 'mixed');
    });
  });

  describe('Individual Selection', () => {
    it('should select individual option', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      render(
        <CheckboxGroup 
          {...defaultProps} 
          onChange={onChange}
        />
      );
      
      const checkbox = screen.getByRole('checkbox', { name: /option 2/i });
      await user.click(checkbox);
      
      expect(onChange).toHaveBeenCalledWith(['value2']);
    });

    it('should deselect individual option', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      render(
        <CheckboxGroup 
          {...defaultProps} 
          selectedValues={['value1', 'value2']}
          onChange={onChange}
        />
      );
      
      const checkbox = screen.getByRole('checkbox', { name: /option 2/i });
      await user.click(checkbox);
      
      expect(onChange).toHaveBeenCalledWith(['value1']);
    });

    it('should handle multiple selections', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      render(
        <CheckboxGroup 
          {...defaultProps} 
          selectedValues={['value1']}
          onChange={onChange}
        />
      );
      
      const checkbox2 = screen.getByRole('checkbox', { name: /option 2/i });
      await user.click(checkbox2);
      
      expect(onChange).toHaveBeenCalledWith(['value1', 'value2']);
    });
  });

  describe('Disabled State', () => {
    it('should disable all checkboxes when group is disabled', () => {
      render(<CheckboxGroup {...defaultProps} disabled={true} />);
      
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toBeDisabled();
      });
    });

    it('should disable individual options', () => {
      const optionsWithDisabled: CheckboxOption[] = [
        { id: 'opt1', label: 'Option 1', value: 'val1' },
        { id: 'opt2', label: 'Option 2', value: 'val2', disabled: true },
        { id: 'opt3', label: 'Option 3', value: 'val3' },
      ];
      
      render(
        <CheckboxGroup 
          {...defaultProps} 
          options={optionsWithDisabled}
        />
      );
      
      const checkbox1 = screen.getByRole('checkbox', { name: /option 1/i });
      const checkbox2 = screen.getByRole('checkbox', { name: /option 2/i });
      const checkbox3 = screen.getByRole('checkbox', { name: /option 3/i });
      
      expect(checkbox1).not.toBeDisabled();
      expect(checkbox2).toBeDisabled();
      expect(checkbox3).not.toBeDisabled();
    });

    it('should not trigger onChange for disabled options', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      const optionsWithDisabled: CheckboxOption[] = [
        { id: 'opt1', label: 'Option 1', value: 'val1' },
        { id: 'opt2', label: 'Option 2', value: 'val2', disabled: true },
      ];
      
      render(
        <CheckboxGroup 
          {...defaultProps} 
          options={optionsWithDisabled}
          onChange={onChange}
        />
      );
      
      const disabledCheckbox = screen.getByRole('checkbox', { name: /option 2/i });
      await user.click(disabledCheckbox);
      
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<CheckboxGroup {...defaultProps} />);
      
      const group = screen.getByRole('group', { name: /test group/i });
      expect(group).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      render(
        <CheckboxGroup 
          {...defaultProps} 
          onChange={onChange}
        />
      );
      
      // Tab to first checkbox
      await user.tab();
      const firstCheckbox = screen.getByRole('checkbox', { name: /option 1/i });
      expect(firstCheckbox).toHaveFocus();
      
      // Space to select
      await user.keyboard(' ');
      expect(onChange).toHaveBeenCalledWith(['value1']);
      
      // Tab to next checkbox
      await user.tab();
      const secondCheckbox = screen.getByRole('checkbox', { name: /option 2/i });
      expect(secondCheckbox).toHaveFocus();
    });

    it('should have proper label associations', () => {
      render(<CheckboxGroup {...defaultProps} />);
      
      mockOptions.forEach(option => {
        const checkbox = screen.getByRole('checkbox', { name: new RegExp(option.label, 'i') });
        expect(checkbox).toHaveAttribute('id', option.id);
        
        const label = screen.getByText(option.label);
        expect(label.closest('label')).toHaveAttribute('for', option.id);
      });
    });
  });

  describe('Performance', () => {
    it('should handle large number of options', () => {
      const manyOptions = Array.from({ length: 100 }, (_, i) => ({
        id: `option${i}`,
        label: `Option ${i}`,
        value: `value${i}`,
      }));
      
      render(
        <CheckboxGroup 
          {...defaultProps} 
          options={manyOptions}
        />
      );
      
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(100);
    });

    it('should efficiently update selected values', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      const manyOptions = Array.from({ length: 50 }, (_, i) => ({
        id: `option${i}`,
        label: `Option ${i}`,
        value: `value${i}`,
      }));
      
      render(
        <CheckboxGroup 
          {...defaultProps} 
          options={manyOptions}
          onChange={onChange}
          showSelectAll={true}
        />
      );
      
      const selectAllButton = screen.getByText('전체 선택');
      await user.click(selectAllButton);
      
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(
        manyOptions.map(opt => opt.value)
      );
    });
  });

  describe('Custom Rendering', () => {
    it('should support custom option rendering', () => {
      const optionsWithCustom: CheckboxOption[] = [
        { 
          id: 'opt1', 
          label: 'Option 1', 
          value: 'val1',
          description: 'This is option 1 description'
        },
      ];
      
      render(
        <CheckboxGroup 
          {...defaultProps} 
          options={optionsWithCustom}
        />
      );
      
      expect(screen.getByText('This is option 1 description')).toBeInTheDocument();
    });

    it('should support custom title rendering', () => {
      render(
        <CheckboxGroup 
          {...defaultProps} 
          title="Test Group"
          titleClassName="custom-title"
        />
      );
      
      const title = screen.getByText('Test Group');
      expect(title).toHaveClass('custom-title');
    });
  });
});