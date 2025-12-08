import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import Home from './Home';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

// Mock useNavigate
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockedNavigate,
    };
});

// Mock axios
vi.mock('axios');

describe('Home Page', () => {
    it('renders correctly', () => {
        render(<BrowserRouter><Home /></BrowserRouter>);
        expect(screen.getByText('Collaborative Coder')).toBeInTheDocument();
        expect(screen.getByText('Create New Room')).toBeInTheDocument();
    });

    it('navigates to new room on create', () => {
        render(<BrowserRouter><Home /></BrowserRouter>);
        fireEvent.click(screen.getByText('Create New Room'));
        expect(mockedNavigate).toHaveBeenCalledWith(expect.stringMatching(/^\/room\//));
    });

    it('shows error for invalid room id', async () => {
        axios.get.mockRejectedValueOnce(new Error('Room not found'));
        render(<BrowserRouter><Home /></BrowserRouter>);

        fireEvent.change(screen.getByPlaceholderText('Enter Room ID'), { target: { value: 'invalid-room' } });
        fireEvent.click(screen.getByText('Join'));

        await waitFor(() => {
            expect(screen.getByText('Invalid Room ID or Room does not exist.')).toBeInTheDocument();
        });
        expect(mockedNavigate).not.toHaveBeenCalledWith('/room/invalid-room');
    });

    it('navigates to valid room', async () => {
        axios.get.mockResolvedValueOnce({ data: { exists: true } });
        render(<BrowserRouter><Home /></BrowserRouter>);

        fireEvent.change(screen.getByPlaceholderText('Enter Room ID'), { target: { value: 'existing-room' } });
        fireEvent.click(screen.getByText('Join'));

        await waitFor(() => {
            expect(mockedNavigate).toHaveBeenCalledWith('/room/existing-room');
        });
    });
});
