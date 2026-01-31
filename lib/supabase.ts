import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export interface Todo {
  id: string;
  title: string;
  description: string | null;
  priority: number;
  category: string;
  action_type: string | null;
  status: string;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  sync_to_calendar: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  // Joined data
  persons?: string[];
  meetings?: string[];
}

export interface Person {
  id: string;
  name: string;
  department: string | null;
  user_id: string | null;
  is_default: boolean;
}

export interface Meeting {
  id: string;
  name: string;
  rhythm: string | null;
  user_id: string | null;
  is_default: boolean;
}

export interface ActionType {
  id: string;
  label: string;
  icon: string;
  user_id: string | null;
  is_default: boolean;
}

export interface Category {
  id: string;
  label: string;
  color: string;
  user_id: string | null;
  is_default: boolean;
}

export interface Priority {
  level: number;
  label: string;
  color: string;
}

export interface StatusOption {
  id: string;
  label: string;
  color: string;
}

// =============================================
// TODOS CRUD (using mf_todos table)
// =============================================

export async function getTodos(userId: string) {
  const { data: todos, error } = await supabase
    .from('mf_todos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Get persons for each todo
  const { data: todoPersons } = await supabase
    .from('mf_todo_persons')
    .select('todo_id, person_id')
    .in('todo_id', todos?.map(t => t.id) || []);

  // Get meetings for each todo
  const { data: todoMeetings } = await supabase
    .from('mf_todo_meetings')
    .select('todo_id, meeting_id')
    .in('todo_id', todos?.map(t => t.id) || []);

  // Merge persons and meetings into todos
  return todos?.map(todo => ({
    ...todo,
    persons: todoPersons?.filter(tp => tp.todo_id === todo.id).map(tp => tp.person_id) || [],
    meetings: todoMeetings?.filter(tm => tm.todo_id === todo.id).map(tm => tm.meeting_id) || [],
  })) || [];
}

export async function createTodo(
  todo: Omit<Todo, 'id' | 'created_at' | 'updated_at' | 'completed_at'>,
  persons: string[],
  meetings: string[]
) {
  const { data, error } = await supabase
    .from('mf_todos')
    .insert(todo)
    .select()
    .single();

  if (error) throw error;

  // Add persons
  if (persons.length > 0) {
    await supabase
      .from('mf_todo_persons')
      .insert(persons.map(personId => ({ todo_id: data.id, person_id: personId })));
  }

  // Add meetings
  if (meetings.length > 0) {
    await supabase
      .from('mf_todo_meetings')
      .insert(meetings.map(meetingId => ({ todo_id: data.id, meeting_id: meetingId })));
  }

  return { ...data, persons, meetings };
}

export async function updateTodo(
  id: string,
  updates: Partial<Todo>,
  persons?: string[],
  meetings?: string[]
) {
  const { data, error } = await supabase
    .from('mf_todos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Update persons if provided
  if (persons !== undefined) {
    await supabase.from('mf_todo_persons').delete().eq('todo_id', id);
    if (persons.length > 0) {
      await supabase
        .from('mf_todo_persons')
        .insert(persons.map(personId => ({ todo_id: id, person_id: personId })));
    }
  }

  // Update meetings if provided
  if (meetings !== undefined) {
    await supabase.from('mf_todo_meetings').delete().eq('todo_id', id);
    if (meetings.length > 0) {
      await supabase
        .from('mf_todo_meetings')
        .insert(meetings.map(meetingId => ({ todo_id: id, meeting_id: meetingId })));
    }
  }

  return { ...data, persons: persons || [], meetings: meetings || [] };
}

export async function deleteTodo(id: string) {
  const { error } = await supabase
    .from('mf_todos')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function toggleTodoCompleted(id: string, completed: boolean) {
  const { data, error } = await supabase
    .from('mf_todos')
    .update({ completed })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =============================================
// PERSONS CRUD (using mf_persons table)
// =============================================

export async function getPersons(userId: string) {
  const { data, error } = await supabase
    .from('mf_persons')
    .select('*')
    .or(`is_default.eq.true,user_id.eq.${userId}`)
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function createPerson(person: { name: string; department?: string; user_id: string }) {
  const { data, error } = await supabase
    .from('mf_persons')
    .insert({ ...person, is_default: false })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePerson(id: string) {
  const { error } = await supabase
    .from('mf_persons')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// =============================================
// MEETINGS CRUD (using mf_meetings table)
// =============================================

export async function getMeetings(userId: string) {
  const { data, error } = await supabase
    .from('mf_meetings')
    .select('*')
    .or(`is_default.eq.true,user_id.eq.${userId}`)
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function createMeeting(meeting: { name: string; rhythm?: string; user_id: string }) {
  const { data, error } = await supabase
    .from('mf_meetings')
    .insert({ ...meeting, is_default: false })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMeeting(id: string) {
  const { error } = await supabase
    .from('mf_meetings')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// =============================================
// ACTION TYPES CRUD (using mf_action_types table)
// =============================================

export async function getActionTypes(userId: string) {
  const { data, error } = await supabase
    .from('mf_action_types')
    .select('*')
    .or(`is_default.eq.true,user_id.eq.${userId}`)
    .order('label');

  if (error) throw error;
  return data || [];
}

export async function createActionType(actionType: { label: string; icon: string; user_id: string }) {
  const { data, error } = await supabase
    .from('mf_action_types')
    .insert({ ...actionType, is_default: false })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteActionType(id: string) {
  const { error } = await supabase
    .from('mf_action_types')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// =============================================
// STATIC DATA (using mf_ tables)
// =============================================

export async function getPriorities() {
  const { data, error } = await supabase
    .from('mf_priorities')
    .select('*')
    .order('level');

  if (error) throw error;
  return data || [];
}

export async function getStatusOptions() {
  const { data, error } = await supabase
    .from('mf_status_options')
    .select('*');

  if (error) throw error;
  return data || [];
}

export async function getCategories(userId: string) {
  const { data, error } = await supabase
    .from('mf_categories')
    .select('*')
    .or(`is_default.eq.true,user_id.eq.${userId}`);

  if (error) throw error;
  return data || [];
}
