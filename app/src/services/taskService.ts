import { Task } from '../types/task';
import * as taskRepository from '../repositories/taskRepository';

export async function getAllTasks(): Promise<Task[]> {
  return taskRepository.findAll();
}

export async function createTask(title: string): Promise<Task> {
  if (!title || title.trim() === '') {
    throw new Error('title is required');
  }
  return taskRepository.create(title.trim());
}

export async function markTaskDone(id: number): Promise<Task | null> {
  return taskRepository.setDone(id);
}
