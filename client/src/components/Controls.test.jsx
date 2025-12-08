import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Controls from './Controls';

describe('Controls Component', () => {
    it('renders language selector and run button', () => {
        render(<Controls language="javascript" onLanguageChange={() => { }} onRun={() => { }} loading={false} />);
        expect(screen.getByRole('button')).toHaveTextContent('Run Code');
        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('calls onRun when button clicked', () => {
        const handleRun = vi.fn();
        render(<Controls language="javascript" onLanguageChange={() => { }} onRun={handleRun} loading={false} />);
        fireEvent.click(screen.getByText('Run Code'));
        expect(handleRun).toHaveBeenCalledTimes(1);
    });

    it('disables button when loading', () => {
        render(<Controls language="javascript" onLanguageChange={() => { }} onRun={() => { }} loading={true} />);
        expect(screen.getByText('Running...')).toBeDisabled();
    });
});
