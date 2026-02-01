// hooks/useMindFlow.ts
// Angepasst an die bestehende Supabase-Datenbankstruktur
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ============================================
// TYPES - Angepasst an deine Datenbank
// ============================================
interface TodoFromDB {
  Ausweis: string;
  Titel: string;
  Beschreibung: string | null;
  priority: number;
  Kategorie: string;
  Aktionstyp: string;
  Status: string;
  Fälligkeitsdatum: string;
  vollendet: boolean;
  unread: boolean;
  'Benutzer-ID': string;
  'erstellt am': string;
  'aktualisiert am': string;
}

interface Todo {
  id: string;
  title: string;
  description: string | null;
  priority: number;
  category: string;
  actionType: string;
  status: string;
  date: string;
  completed: boolean;
  unread: boolean;
  user_id: string;
  persons?: string[];
  meetings?: string[];
}

interface Category {
  id: string;
  label: string;
  color: string;
}

// ============================================
// HELPER: Datenbank-Format zu App-Format
// ============================================
const dbToAppTodo = (dbTodo: TodoFromDB, persons: string[] = [], meetings: string[] = []): Todo => ({
  id: dbTodo.Ausweis,
  title: dbTodo.Titel,
  description: dbTodo.Beschreibung,
  priority: dbTodo.priority,
  category: dbTodo.Kategorie,
  actionType: dbTodo.Aktionstyp,
  status: dbTodo.Status,
  date: formatDateForApp(dbTodo.Fälligkeitsdatum),
  completed: dbTodo.vollendet,
  unread: dbTodo.unread ?? true,
  user_id: dbTodo['Benutzer-ID'],
  persons,
  meetings,
});

// Datum von DB-Format zu App-Format
const formatDateForApp = (dbDate: string): string => {
  if (!dbDate) return 'Heute';
  
  const date = new Date(dbDate);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Prüfe ob heute
  if (date.toDateString() === today.toDateString()) {
    return 'Heute';
  }
  
  // Prüfe ob morgen
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Morgen';
  }
  
  // Sonst formatiertes Datum
  const months = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'];
  return `${date.getDate()}. ${months[date.getMonth()]}`;
};

// Datum von App-Format zu DB-Format
const formatDateForDB = (appDate: string): string => {
  const today = new Date();
  
  if (appDate === 'Heute') {
    return today.toISOString().split('T')[0];
  }
  
  if (appDate === 'Morgen') {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
  
  if (appDate === 'Diese Woche') {
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
    return endOfWeek.toISOString().split('T')[0];
  }
  
  if (appDate === 'Nächste Woche') {
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  }
  
  // Versuche Datum zu parsen (z.B. "15. März")
  const months: Record<string, number> = {
    'Jan': 0, 'Feb': 1, 'März': 2, 'Apr': 3, 'Mai': 4, 'Juni': 5,
    'Juli': 6, 'Aug': 7, 'Sep': 8, 'Okt': 9, 'Nov': 10, 'Dez': 11
  };
  
  const match = appDate.match(/(\d+)\.\s*(\w+)/);
  if (match) {
    const day = parseInt(match[1]);
    const monthStr = match[2].replace('.', '');
    const month = months[monthStr] ?? 0;
    const date = new Date(today.getFullYear(), month, day);
    return date.toISOString().split('T')[0];
  }
  
  return today.toISOString().split('T')[0];
};

// ============================================
// AUTH HOOK
// ============================================
export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, signOut };
}

// ============================================
// TODOS HOOK
// ============================================
export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Todos mit Persons und Meetings
  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch todos
      const { data: todosData, error: todosError } = await supabase
        .from('todos')
        .select('*')
        .order('erstellt am', { ascending: false });

      if (todosError) throw todosError;

      // Fetch all persons relations
      const { data: personsData } = await supabase
        .from('todo_persons')
        .select('todo_id, "Personen-ID"');

      // Fetch all meetings relations
      const { data: meetingsData } = await supabase
        .from('todo_meetings')
        .select('todo_id, "Meeting-ID"');

      // Group persons by todo_id
      const personsByTodo: Record<string, string[]> = {};
      personsData?.forEach((p: any) => {
        if (!personsByTodo[p.todo_id]) personsByTodo[p.todo_id] = [];
        personsByTodo[p.todo_id].push('@' + p['Personen-ID']);
      });

      // Group meetings by todo_id
      const meetingsByTodo: Record<string, string[]> = {};
      meetingsData?.forEach((m: any) => {
        if (!meetingsByTodo[m.todo_id]) meetingsByTodo[m.todo_id] = [];
        meetingsByTodo[m.todo_id].push('#' + m['Meeting-ID']);
      });

      // Convert to app format
      const appTodos = todosData?.map((t: TodoFromDB) => 
        dbToAppTodo(t, personsByTodo[t.Ausweis] || [], meetingsByTodo[t.Ausweis] || [])
      ) || [];

      setTodos(appTodos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Create Todo
  const createTodo = async (todo: Partial<Todo>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Nicht angemeldet');

    const { data, error } = await supabase
      .from('todos')
      .insert({
        'Titel': todo.title,
        'Beschreibung': todo.description || null,
        'priority': todo.priority || 3,
        'Kategorie': todo.category || 'Arbeit',
        'Aktionstyp': todo.actionType || 'check',
        'Status': todo.status || 'Offen',
        'Fälligkeitsdatum': formatDateForDB(todo.date || 'Heute'),
        'vollendet': false,
        'unread': true,
        'Benutzer-ID': user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Add persons if provided
    if (todo.persons && todo.persons.length > 0) {
      const personsToInsert = todo.persons.map(p => ({
        todo_id: data.Ausweis,
        'Personen-ID': p.replace('@', ''),
      }));
      await supabase.from('todo_persons').insert(personsToInsert);
    }

    // Add meetings if provided
    if (todo.meetings && todo.meetings.length > 0) {
      const meetingsToInsert = todo.meetings.map(m => ({
        todo_id: data.Ausweis,
        'Meeting-ID': m.replace('#', ''),
      }));
      await supabase.from('todo_meetings').insert(meetingsToInsert);
    }

    await fetchTodos();
    return data;
  };

  // Update Todo
  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    const dbUpdates: Record<string, any> = {};
    
    if (updates.title !== undefined) dbUpdates['Titel'] = updates.title;
    if (updates.description !== undefined) dbUpdates['Beschreibung'] = updates.description;
    if (updates.priority !== undefined) dbUpdates['priority'] = updates.priority;
    if (updates.category !== undefined) dbUpdates['Kategorie'] = updates.category;
    if (updates.actionType !== undefined) dbUpdates['Aktionstyp'] = updates.actionType;
    if (updates.status !== undefined) dbUpdates['Status'] = updates.status;
    if (updates.date !== undefined) dbUpdates['Fälligkeitsdatum'] = formatDateForDB(updates.date);
    if (updates.completed !== undefined) dbUpdates['vollendet'] = updates.completed;
    if (updates.unread !== undefined) dbUpdates['unread'] = updates.unread;

    const { error } = await supabase
      .from('todos')
      .update(dbUpdates)
      .eq('Ausweis', id);

    if (error) throw error;
    
    // Update local state
    setTodos(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  // Delete Todo
  const deleteTodo = async (id: string) => {
    // Delete related persons and meetings first
    await supabase.from('todo_persons').delete().eq('todo_id', id);
    await supabase.from('todo_meetings').delete().eq('todo_id', id);
    
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('Ausweis', id);

    if (error) throw error;
    
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  // Helper functions
  const toggleComplete = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    const newCompleted = !todo.completed;
    await updateTodo(id, {
      completed: newCompleted,
      status: newCompleted ? 'Erledigt' : 'Offen',
    });
  };

  const updateStatus = async (id: string, status: string) => {
    await updateTodo(id, {
      status,
      completed: status === 'Erledigt',
    });
  };

  const updatePriority = async (id: string, priority: number) => {
    await updateTodo(id, { priority });
  };

  const updateCategory = async (id: string, category: string) => {
    await updateTodo(id, { category });
  };

  const updateActionType = async (id: string, actionType: string) => {
    await updateTodo(id, { actionType });
  };

  const updateDate = async (id: string, date: string) => {
    await updateTodo(id, { date });
  };

  const updateTitle = async (id: string, title: string) => {
    await updateTodo(id, { title });
  };

  const updateDescription = async (id: string, description: string) => {
    await updateTodo(id, { description });
  };

  const markAsRead = async (id: string) => {
    await updateTodo(id, { unread: false });
  };

  return {
    todos,
    loading,
    error,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    updateStatus,
    updatePriority,
    updateCategory,
    updateActionType,
    updateDate,
    updateTitle,
    updateDescription,
    markAsRead,
  };
}

// ============================================
// CATEGORIES HOOK
// ============================================
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mf_categories')
        .select('*')
        .order('erstellt am', { ascending: true });

      if (error) throw error;

      const appCategories = data?.map((c: any) => ({
        id: c.Ausweis,
        label: c.Etikett,
        color: c.Farbe,
      })) || [];

      setCategories(appCategories);
    } catch (err) {
      console.error('Fehler beim Laden der Kategorien:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (id: string, label: string, color: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Nicht angemeldet');

    const { error } = await supabase
      .from('mf_categories')
      .insert({
        'Ausweis': id,
        'Etikett': label,
        'Farbe': color,
        'Benutzer-ID': user.id,
        'is_default': false,
      });

    if (error) throw error;
    
    setCategories(prev => [...prev, { id, label, color }]);
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase
      .from('mf_categories')
      .delete()
      .eq('Ausweis', id);

    if (error) throw error;
    
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  return {
    categories,
    loading,
    createCategory,
    deleteCategory,
  };
}

// ============================================
// COMBINED HOOK
// ============================================
export function useMindFlow() {
  const auth = useAuth();
  const todos = useTodos();
  const categories = useCategories();

  return {
    // Auth
    user: auth.user,
    authLoading: auth.loading,
    signOut: auth.signOut,
    
    // Todos
    todos: todos.todos,
    todosLoading: todos.loading,
    todosError: todos.error,
    createTodo: todos.createTodo,
    updateTodo: todos.updateTodo,
    deleteTodo: todos.deleteTodo,
    toggleComplete: todos.toggleComplete,
    updateStatus: todos.updateStatus,
    updatePriority: todos.updatePriority,
    updateCategory: todos.updateCategory,
    updateActionType: todos.updateActionType,
    updateDate: todos.updateDate,
    updateTitle: todos.updateTitle,
    updateDescription: todos.updateDescription,
    markAsRead: todos.markAsRead,
    
    // Categories
    categories: categories.categories,
    categoriesLoading: categories.loading,
    createCategory: categories.createCategory,
    deleteCategory: categories.deleteCategory,
    
    // Combined loading
    isLoading: auth.loading || todos.loading || categories.loading,
  };
}
