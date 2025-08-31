import { render, screen, fireEvent } from '@testing-library/react'
import TaskCard from '../TaskCard'
import { Task } from '@/lib/types'

// Mock task data
const mockTask: Task = {
  _id: '507f1f77bcf86cd799439011',
  task: 'Test Task',
  description: 'Test description',
  status: 'Pending',
  priority: 'High',
  labels: ['work', 'urgent'],
  createdAt: '2023-01-01T00:00:00Z',
  user: '507f1f77bcf86cd799439012',
}

const mockTaskWithImages: Task = {
  ...mockTask,
  images: [
    { public_id: 'test1', url: 'https://res.cloudinary.com/test/test1.jpg', width: 800, height: 600 },
    { public_id: 'test2', url: 'https://res.cloudinary.com/test/test2.jpg', width: 800, height: 600 },
    { public_id: 'test3', url: 'https://res.cloudinary.com/test/test3.jpg', width: 800, height: 600 },
    { public_id: 'test4', url: 'https://res.cloudinary.com/test/test4.jpg', width: 800, height: 600 },
  ]
}

describe('TaskCard', () => {
  beforeEach(() => {
    // Reset fetch mock
    (global.fetch as jest.Mock).mockClear()
  })

  test('renders task information correctly', () => {
    render(<TaskCard task={mockTask} />)
    
    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('work')).toBeInTheDocument()
    expect(screen.getByText('urgent')).toBeInTheDocument()
  })

  test('displays image thumbnails when task has images', () => {
    render(<TaskCard task={mockTaskWithImages} />)
    
    // Should display first 3 images as thumbnails
    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(3)
    
    // Check that Cloudinary transformations are applied
    expect(images[0]).toHaveAttribute('src', expect.stringContaining('w_60,h_45,c_fill'))
    
    // Should show +1 indicator for remaining images
    expect(screen.getByText('+1')).toBeInTheDocument()
  })

  test('does not display image section when task has no images', () => {
    render(<TaskCard task={mockTask} />)
    
    const images = screen.queryAllByRole('img')
    // Only FontAwesome icons should be present, no task images
    expect(images.filter(img => img.getAttribute('alt')?.includes('Task image'))).toHaveLength(0)
  })

  test('handles task click navigation', () => {
    // Mock window.location.href
    const mockLocation = { href: '' }
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true
    })
    
    render(<TaskCard task={mockTask} />)
    
    const card = screen.getByRole('generic', { name: /card/ })
    fireEvent.click(card)
    
    // Should navigate to task detail page
    expect(window.location.href).toBe(`/tasks/${mockTask._id}`)
  })

  test('shows action buttons when showDeleteButton is true', () => {
    const mockOnDelete = jest.fn()
    render(
      <TaskCard 
        task={mockTask} 
        onDelete={mockOnDelete} 
        showDeleteButton={true} 
      />
    )
    
    expect(screen.getByRole('link', { name: /edit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  test('calls onDelete when delete button is clicked and confirmed', () => {
    const mockOnDelete = jest.fn()
    // Mock window.confirm
    window.confirm = jest.fn().mockReturnValue(true)
    
    render(
      <TaskCard 
        task={mockTask} 
        onDelete={mockOnDelete} 
        showDeleteButton={true} 
      />
    )
    
    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)
    
    expect(window.confirm).toHaveBeenCalled()
    expect(mockOnDelete).toHaveBeenCalledWith(mockTask._id)
  })

  test('does not call onDelete when delete is cancelled', () => {
    const mockOnDelete = jest.fn()
    // Mock window.confirm to return false
    window.confirm = jest.fn().mockReturnValue(false)
    
    render(
      <TaskCard 
        task={mockTask} 
        onDelete={mockOnDelete} 
        showDeleteButton={true} 
      />
    )
    
    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)
    
    expect(window.confirm).toHaveBeenCalled()
    expect(mockOnDelete).not.toHaveBeenCalled()
  })
})