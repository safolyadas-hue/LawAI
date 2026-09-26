/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axe } from 'vitest-axe';
import '@testing-library/jest-dom/vitest';
import ChatInterface from '../components/ChatInterface';
import * as analyzeDocumentModule from '../lib/analyzeDocument';

// Mock the module dependency
vi.mock('../lib/analyzeDocument', () => ({
  analyzeDocument: vi.fn(),
}));

describe('ChatInterface', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input and button', () => {
    render(<ChatInterface documentText="test doc" chatHistory={[]} setChatHistory={vi.fn()} />);
    expect(screen.getByPlaceholderText(/Ask a question about the document/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send message/i })).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<ChatInterface documentText="test doc" chatHistory={[]} setChatHistory={vi.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('calls analyzeDocument on submit with a non-empty query', async () => {
    const setChatHistory = vi.fn();
    (analyzeDocumentModule.analyzeDocument as any).mockResolvedValue('simplified answer');
    
    render(<ChatInterface documentText="test doc" chatHistory={[]} setChatHistory={setChatHistory} />);
    
    const input = screen.getByPlaceholderText(/Ask a question about the document/i);
    const button = screen.getByRole('button', { name: /Send message/i });
    
    const user = userEvent.setup();
    await user.type(input, 'What is the risk?');
    await user.click(button);
    
    await waitFor(() => {
      expect(analyzeDocumentModule.analyzeDocument).toHaveBeenCalledWith(
        'Question: What is the risk?\n\nDocument Context:\ntest doc',
        'test doc'
      );
    });
    
    expect(setChatHistory).toHaveBeenCalledWith([
      { question: 'What is the risk?', answer: 'simplified answer' }
    ]);
  });

  it('does nothing when submitting empty query', async () => {
    const setChatHistory = vi.fn();
    render(<ChatInterface documentText="test doc" chatHistory={[]} setChatHistory={setChatHistory} />);
    
    const button = screen.getByRole('button', { name: /Send message/i });
    const user = userEvent.setup();
    await user.click(button); // input is empty
    
    expect(analyzeDocumentModule.analyzeDocument).not.toHaveBeenCalled();
  });
});
