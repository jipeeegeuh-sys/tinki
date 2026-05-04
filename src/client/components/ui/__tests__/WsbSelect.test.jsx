import { jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WsbSelect } from '../WsbSelect';

const defaultOptions = [
  { value: 'A', label: 'Option A' },
  { value: 'B', label: 'Option B' },
  { value: 'C', label: 'Option C' },
];

function renderSelect(props = {}) {
  const defaultProps = {
    id: 'test-select',
    label: 'Mon champ',
    options: defaultOptions,
    value: '',
    onChange: jest.fn(),
    ...props,
  };
  return { ...render(<WsbSelect {...defaultProps} />), onChange: defaultProps.onChange };
}

describe('WsbSelect — rendu', () => {
  test('affiche le label', () => {
    renderSelect();
    expect(screen.getByText(/Mon champ/)).toBeInTheDocument();
  });

  test('affiche le placeholder quand aucune valeur', () => {
    renderSelect({ placeholder: 'Choisir…' });
    expect(screen.getByText('Choisir…')).toBeInTheDocument();
  });

  test('affiche la valeur sélectionnée', () => {
    renderSelect({ value: 'B' });
    expect(screen.getByText('Option B')).toBeInTheDocument();
  });

  test('le trigger porte role="combobox"', () => {
    renderSelect();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  test('aria-expanded est false par défaut', () => {
    renderSelect();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
  });

  test('aria-haspopup est "listbox"', () => {
    renderSelect();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-haspopup', 'listbox');
  });

  test('la listbox est fermée par défaut', () => {
    renderSelect();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  test('affiche l\'astérisque required', () => {
    renderSelect({ required: true });
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});

describe('WsbSelect — ouverture/fermeture', () => {
  test('ouvre la listbox au clic', () => {
    renderSelect();
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
  });

  test('affiche toutes les options', () => {
    renderSelect();
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  test('ferme la listbox au clic extérieur', () => {
    renderSelect();
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  test('ferme la listbox sur Escape', () => {
    renderSelect();
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  test('toggle au double clic', () => {
    renderSelect();
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.click(trigger);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});

describe('WsbSelect — sélection', () => {
  test('appelle onChange au clic sur une option', () => {
    const { onChange } = renderSelect();
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('Option B'));
    expect(onChange).toHaveBeenCalledWith('B');
  });

  test('ferme la listbox après sélection', () => {
    renderSelect();
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('Option A'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  test('l\'option sélectionnée porte aria-selected="true"', () => {
    renderSelect({ value: 'B' });
    fireEvent.click(screen.getByRole('combobox'));
    const options = screen.getAllByRole('option');
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
    expect(options[0]).toHaveAttribute('aria-selected', 'false');
  });
});

describe('WsbSelect — navigation clavier', () => {
  test('ouvre avec ArrowDown', () => {
    renderSelect();
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  test('ouvre avec Enter', () => {
    renderSelect();
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  test('sélectionne avec Enter après navigation', () => {
    const { onChange } = renderSelect();
    const trigger = screen.getByRole('combobox');
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('B');
  });

  test('ArrowUp remonte dans les options', () => {
    const { onChange } = renderSelect();
    const trigger = screen.getByRole('combobox');
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(trigger, { key: 'ArrowUp' });
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('B');
  });
});
