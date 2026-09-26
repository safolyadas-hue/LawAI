/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { axe } from 'vitest-axe';
import '@testing-library/jest-dom/vitest';
import DocumentUploader from '../components/DocumentUploader';

describe('DocumentUploader', () => {
  it('renders correctly', () => {
    render(<DocumentUploader setDocumentText={vi.fn()} />);
    expect(screen.getByText('Upload Legal Document')).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<DocumentUploader setDocumentText={vi.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('calls setDocumentText with file content when a .txt file is selected', async () => {
    const setDocumentText = vi.fn();
    render(<DocumentUploader setDocumentText={setDocumentText} />);
    
    const file = new File(['hello world'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/Upload a document for analysis/i);
    
    const user = userEvent.setup();
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(setDocumentText).toHaveBeenCalledWith('hello world');
    });
  });

  it('calls onAnalyze only on button click, never automatically', async () => {
    const onAnalyze = vi.fn();
    render(<DocumentUploader setDocumentText={vi.fn()} onAnalyze={onAnalyze} />);
    
    const file = new File(['hello world'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/Upload a document for analysis/i);
    
    const user = userEvent.setup();
    await user.upload(input, file);
    
    expect(onAnalyze).not.toHaveBeenCalled();
    
    const button = screen.getByRole('button', { name: /Upload and analyze the selected document/i });
    await user.click(button);
    
    expect(onAnalyze).toHaveBeenCalledOnce();
  });
});
