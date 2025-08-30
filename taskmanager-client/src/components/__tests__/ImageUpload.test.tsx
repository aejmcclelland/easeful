import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ImageUpload from '../ImageUpload'

const mockCurrentImages = [
  { public_id: 'test1', url: 'https://res.cloudinary.com/test/test1.jpg', width: 800, height: 600 },
  { public_id: 'test2', url: 'https://res.cloudinary.com/test/test2.jpg', width: 800, height: 600 },
]

describe('ImageUpload', () => {
  const mockOnUploadSuccess = jest.fn()
  const defaultProps = {
    taskId: '507f1f77bcf86cd799439011',
    currentImages: [],
    onUploadSuccess: mockOnUploadSuccess,
  }

  beforeEach(() => {
    // Reset mocks
    (global.fetch as jest.Mock).mockClear()
    mockOnUploadSuccess.mockClear()
  })

  test('renders upload interface when under image limit', () => {
    render(<ImageUpload {...defaultProps} />)
    
    expect(screen.getByText('Upload Images (0/6 used)')).toBeInTheDocument()
    expect(screen.getByLabelText(/upload images/i)).toBeInTheDocument()
    expect(screen.getByText(/JPEG, PNG, WebP, GIF up to 10MB each/)).toBeInTheDocument()
  })

  test('shows maximum images reached when at limit', () => {
    const maxImages = Array.from({ length: 6 }, (_, i) => ({
      public_id: `test${i}`,
      url: `https://res.cloudinary.com/test/test${i}.jpg`,
      width: 800,
      height: 600,
    }))

    render(<ImageUpload {...defaultProps} currentImages={maxImages} />)
    
    expect(screen.getByText('Maximum 6 images reached')).toBeInTheDocument()
    expect(screen.queryByLabelText(/upload images/i)).not.toBeInTheDocument()
  })

  test('shows correct remaining slots count', () => {
    render(<ImageUpload {...defaultProps} currentImages={mockCurrentImages} />)
    
    expect(screen.getByText('Upload Images (2/6 used)')).toBeInTheDocument()
    expect(screen.getByText(/Max 4 more images/)).toBeInTheDocument()
  })

  test('validates file selection count', async () => {
    render(<ImageUpload {...defaultProps} currentImages={mockCurrentImages} />)
    
    const fileInput = screen.getByLabelText(/upload images/i) as HTMLInputElement
    
    // Create mock files that exceed remaining slots (4)
    const files = Array.from({ length: 5 }, (_, i) => 
      new File([`test${i}`], `test${i}.jpg`, { type: 'image/jpeg' })
    )
    
    Object.defineProperty(fileInput, 'files', {
      value: files,
      writable: false,
    })

    fireEvent.change(fileInput)
    
    // Should not show selected files due to count validation
    expect(screen.queryByText('5 file(s) selected')).not.toBeInTheDocument()
  })

  test('validates file types', async () => {
    render(<ImageUpload {...defaultProps} />)
    
    const fileInput = screen.getByLabelText(/upload images/i) as HTMLInputElement
    
    // Create invalid file type
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })
    
    Object.defineProperty(fileInput, 'files', {
      value: [invalidFile],
      writable: false,
    })

    fireEvent.change(fileInput)
    
    // Should not show selected files due to type validation
    expect(screen.queryByText('1 file(s) selected')).not.toBeInTheDocument()
  })

  test('validates file sizes', async () => {
    render(<ImageUpload {...defaultProps} />)
    
    const fileInput = screen.getByLabelText(/upload images/i) as HTMLInputElement
    
    // Create file larger than 10MB
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { 
      type: 'image/jpeg' 
    })
    
    Object.defineProperty(fileInput, 'files', {
      value: [largeFile],
      writable: false,
    })

    fireEvent.change(fileInput)
    
    // Should not show selected files due to size validation
    expect(screen.queryByText('1 file(s) selected')).not.toBeInTheDocument()
  })

  test('shows preview of selected valid files', async () => {
    render(<ImageUpload {...defaultProps} />)
    
    const fileInput = screen.getByLabelText(/upload images/i) as HTMLInputElement
    
    const validFiles = [
      new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
      new File(['test2'], 'test2.png', { type: 'image/png' }),
    ]
    
    Object.defineProperty(fileInput, 'files', {
      value: validFiles,
      writable: false,
    })

    fireEvent.change(fileInput)
    
    expect(screen.getByText('2 file(s) selected')).toBeInTheDocument()
    expect(screen.getByText('test1.jpg')).toBeInTheDocument()
    expect(screen.getByText('test2.png')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /upload 2 image/i })).toBeInTheDocument()
  })

  test('clears file selection', async () => {
    render(<ImageUpload {...defaultProps} />)
    
    const fileInput = screen.getByLabelText(/upload images/i) as HTMLInputElement
    
    const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    
    Object.defineProperty(fileInput, 'files', {
      value: [validFile],
      writable: false,
    })

    fireEvent.change(fileInput)
    
    expect(screen.getByText('1 file(s) selected')).toBeInTheDocument()
    
    const clearButton = screen.getByRole('button', { name: /clear/i })
    fireEvent.click(clearButton)
    
    expect(screen.queryByText('1 file(s) selected')).not.toBeInTheDocument()
  })

  test('successfully uploads files', async () => {
    // Mock successful API response
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, count: 2, data: {} }),
    })

    render(<ImageUpload {...defaultProps} />)
    
    const fileInput = screen.getByLabelText(/upload images/i) as HTMLInputElement
    
    const validFiles = [
      new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
      new File(['test2'], 'test2.png', { type: 'image/png' }),
    ]
    
    Object.defineProperty(fileInput, 'files', {
      value: validFiles,
      writable: false,
    })

    fireEvent.change(fileInput)
    
    const uploadButton = screen.getByRole('button', { name: /upload 2 image/i })
    fireEvent.click(uploadButton)
    
    // Should show uploading state
    expect(screen.getByText('Uploading...')).toBeInTheDocument()
    
    // Wait for upload to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/taskman/507f1f77bcf86cd799439011/photo',
        expect.objectContaining({
          method: 'PUT',
          credentials: 'include',
        })
      )
    })
    
    expect(mockOnUploadSuccess).toHaveBeenCalled()
  })

  test('handles upload errors', async () => {
    // Mock API error response
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Upload failed' }),
    })

    render(<ImageUpload {...defaultProps} />)
    
    const fileInput = screen.getByLabelText(/upload images/i) as HTMLInputElement
    
    const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    
    Object.defineProperty(fileInput, 'files', {
      value: [validFile],
      writable: false,
    })

    fireEvent.change(fileInput)
    
    const uploadButton = screen.getByRole('button', { name: /upload 1 image/i })
    fireEvent.click(uploadButton)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
    
    // Should not call success callback on error
    expect(mockOnUploadSuccess).not.toHaveBeenCalled()
  })
})