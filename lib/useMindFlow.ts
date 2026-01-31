'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  supabase, Todo, Person, Meeting, ActionType, Priority, StatusOption, Category,
  getTodos, createTodo, updateTodo, deleteTodo, toggleTodoCompleted,
  getPersons, createPerson, deletePerson,
  getMeetings, createMeeting, deleteMeeting,
  getActionTypes, createActionType, deleteActionType,
  getPriorities, getStatusOptions, getCategories,
} from './supabase';

export function useMindFlow(userId: string | undefined) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [actionTypes, setActionTypes] = useState<ActionType[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [todosData, personsData, meetingsData, actionTypesData, prioritiesData, statusOptionsData, categoriesData] = await Promise.all([
        getTodos(userId), getPersons(userId), getMeetings(userId), getActionTypes(userId),
        getPriorities(), getStatusOptions(), getCategories(userId),
      ]);
      setTodos(todosData); setPersons(personsData); setMeetings(meetingsData);
      setActionTypes(actionTypesData); setPriorities(prioritiesData);
      setStatusOptions(statusOptionsData); setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!userId) return;
    const subscription = supabase.channel('mf_todos_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mf_todos', filter: `user_id=eq.${userId}` }, () => loadData())
      .subscribe();
    return () => { subscription.unsubscribe(); };
  }, [userId, loadData]);

  const addTodo = async (todo: Omit<Todo, 'id' | 'created_at' | 'updated_at' | 'completed_at' | 'user_id'>, todoPersons: string[], todoMeetings: string[]) => {
    if (!userId) return;
    const newTodo = await createTodo({ ...todo, user_id: userId }, todoPersons, todoMeetings);
    setTodos(prev => [newTodo, ...prev]);
    return newTodo;
  };

  const editTodo = async (id: string, updates: Partial<Todo>, todoPersons?: string[], todoMeetings?: string[]) => {
    const updatedTodo = await updateTodo(id, updates, todoPersons, todoMeetings);
    setTodos(prev => prev.map(t => t.id === id ? { ...t, ...updatedTodo, persons: todoPersons || t.persons, meetings: todoMeetings || t.meetings } : t));
    return updatedTodo;
  };

  const removeTodo = async (id: string) => { await deleteTodo(id); setTodos(prev => prev.filter(t => t.id !== id)); };
  
  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    const updated = await toggleTodoCompleted(id, !todo.completed);
    setTodos(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
  };

  const addPerson = async (name: string, department?: string) => {
    if (!userId) return;
    const newPerson = await createPerson({ name, department, user_id: userId });
    setPersons(prev => [...prev, newPerson]);
    return newPerson;
  };

  const removePerson = async (id: string) => { await deletePerson(id); setPersons(prev => prev.filter(p => p.id !== id)); };

  const addMeeting = async (name: string, rhythm?: string) => {
    if (!userId) return;
    const newMeeting = await createMeeting({ name, rhythm, user_id: userId });
    setMeetings(prev => [...prev, newMeeting]);
    return newMeeting;
  };

  const removeMeeting = async (id: string) => { await deleteMeeting(id); setMeetings(prev => prev.filter(m => m.id !== id)); };

  const addActionType = async (label: string, icon: string) => {
    if (!userId) return;
    const newActionType = await createActionType({ label, icon, user_id: userId });
    setActionTypes(prev => [...prev, newActionType]);
    return newActionType;
  };

  const removeActionType = async (id: string) => { await deleteActionType(id); setActionTypes(prev => prev.filter(a => a.id !== id)); };

  return {
    todos, persons, meetings, actionTypes, priorities, statusOptions, categories, loading, error,
    addTodo, editTodo, removeTodo, toggleTodo,
    addPerson, removePerson, addMeeting, removeMeeting, addActionType, removeActionType,
    reload: loadData,
  };
}
