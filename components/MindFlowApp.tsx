'use client';

import React, { useState, useEffect } from 'react';

// Type Definitions
interface Category {
  id: string;
  label: string;
  color: string;
}

interface Priority {
  level: number;
  label: string;
  color: string;
}

interface Todo {
  id: string;
  title: string;
  description?: string;
  category: string;
  actionType: string;
  priority: number;
  status: string;
  date: string;
  persons?: string[];
  meetings?: string[];
  unread: boolean;
  completed: boolean;
}

interface CalendarModalState {
  show: boolean;
  todo: Todo | null;
}

// Color Palette - Mint Dark Liquid Glass
const colors = {
  mint: '#46F0D2',
  coral: '#FF6B8A',
  orange: '#FFAB5E',
  purple: '#A78BFA',
  skyBlue: '#5BC0EB',
  peach: '#FBE2B4',
  darkBg: '#131321',
  white: '#FFFFFF',
};

const priorities = [
  { level: 1, label: 'Kritisch', color: colors.coral },
  { level: 2, label: 'Hoch', color: colors.orange },
  { level: 3, label: 'Mittel', color: colors.mint },
  { level: 4, label: 'Niedrig', color: colors.purple },
  { level: 5, label: 'Minimal', color: colors.skyBlue },
];

const categories = [
  { id: 'arbeit', label: 'Arbeit', color: colors.mint },
  { id: 'finanzen', label: 'Finanzen', color: colors.skyBlue },
  { id: 'privat', label: 'Privat', color: colors.purple },
  { id: 'gesundheit', label: 'Gesundheit', color: colors.coral },
];

// SVG Icons - Original MindFlow Icons
const Icons = {
  email: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  chat: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="9" cy="7" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 18c0-3 2.5-5 6-5s6 2 6 5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 8h2m2 0h1M16 11h3m1 0h1" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
  ),
  speaker: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
  ),
  speakerOff: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
  ),
  tasks: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  mic: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  ),
  filter: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
  bolt: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  persons: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  calendar: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  chevron: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  sun: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  moon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} opacity={0.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  ),
  search: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
};

// Onboarding Todos - Shown for new users before Supabase data loads
// In production, these are created automatically via Supabase trigger
const onboardingTodos: Todo[] = [
  { 
    id: 'onboarding-1', 
    title: 'Willkommen bei MindFlow! 👋', 
    description: 'Tippe auf diese Aufgabe um die Details zu sehen. Du kannst den Titel, die Beschreibung und alle anderen Felder bearbeiten. Halte lange auf die Kategorie oder den Aktionstyp gedrückt um sie zu ändern.', 
    category: 'arbeit', 
    actionType: 'check', 
    priority: 2, 
    status: 'Offen', 
    date: 'Heute', 
    unread: true, 
    completed: false 
  },
  { 
    id: 'onboarding-2', 
    title: 'Erstelle deine erste eigene Aufgabe', 
    description: 'Nutze das Mikrofon-Symbol unten in der Mitte um per Sprache eine neue Aufgabe zu erstellen. Oder lösche diese Beispiel-Aufgaben wenn du bereit bist!', 
    category: 'arbeit', 
    actionType: 'chat', 
    priority: 3, 
    status: 'Offen', 
    date: 'Morgen', 
    unread: true, 
    completed: false 
  },
];

// Liquid Glass Card Component
interface GlassCardProps {
  children: React.ReactNode;
  color: string;
  darkMode: boolean;
  style?: React.CSSProperties;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, color, darkMode, style = {} }) => (
  <div style={{
    position: 'relative',
    borderRadius: '16px',
    overflow: 'visible',
    background: darkMode 
      ? 'linear-gradient(145deg, rgba(25, 28, 40, 0.8), rgba(25, 28, 40, 0.6))'
      : 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: `1px solid ${darkMode ? `${color}20` : 'rgba(255,255,255,0.6)'}`,
    boxShadow: darkMode 
      ? '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
      : '0 4px 16px rgba(0,0,0,0.1)',
    ...style,
  }}>
    {/* Background glow */}
    {darkMode && (
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `radial-gradient(ellipse at 0% 50%, ${color}12 0%, transparent 50%)`,
        pointerEvents: 'none',
      }} />
    )}
    {/* Left accent line - show in both modes */}
    <div style={{
      position: 'absolute',
      left: 0,
      top: '16px',
      bottom: '16px',
      width: '3px',
      background: `linear-gradient(180deg, ${color}${darkMode ? '90' : 'CC'} 0%, ${color}${darkMode ? '40' : '60'} 100%)`,
      borderRadius: '0 3px 3px 0',
      boxShadow: darkMode 
        ? `0 0 15px ${color}60, 0 0 30px ${color}30`
        : `0 0 8px ${color}40`,
    }} />
    <div style={{ position: 'relative', padding: '16px', paddingLeft: '20px' }}>
      {children}
    </div>
  </div>
);

// Stat Card Component
interface StatCardProps {
  value: number;
  label: string;
  color: string;
  darkMode: boolean;
  active?: boolean;
  onClick?: () => void;
  hasUnread?: boolean;
  onLongPress?: () => void;
  showDropdown?: boolean;
  dropdownOptions?: string[];
  onSelectOption?: (option: string) => void;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, color, darkMode, active, onClick, hasUnread, onLongPress, showDropdown, dropdownOptions, onSelectOption }) => {
  let pressTimer: NodeJS.Timeout | null = null;

  const handleMouseDown = () => {
    if (onLongPress) {
      pressTimer = setTimeout(() => {
        onLongPress();
      }, 500);
    }
  };

  const handleMouseUp = () => {
    if (pressTimer) clearTimeout(pressTimer);
  };

  return (
    <div style={{ position: 'relative', zIndex: showDropdown ? 1000 : 1 }}>
      <button
        onClick={onClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '16px',
          padding: '12px',
          textAlign: 'center',
          transition: 'transform 0.2s',
          cursor: 'pointer',
          border: `1px solid ${darkMode ? `${color}15` : 'rgba(255,255,255,0.6)'}`,
          background: darkMode 
            ? 'linear-gradient(145deg, rgba(25, 28, 40, 0.8), rgba(25, 28, 40, 0.6))'
            : 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: active 
            ? `0 0 0 2px ${color}, 0 8px 32px rgba(0,0,0,0.3)`
            : darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.1)',
          width: '100%',
        }}
      >
        {/* Unread indicator - show in both modes */}
        {hasUnread && (
          <div style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: color,
            boxShadow: darkMode 
              ? `0 0 10px ${color}, 0 0 20px ${color}50`
              : `0 0 6px ${color}80`,
          }} />
        )}
        <p style={{ fontSize: '20px', fontWeight: 'bold', color, margin: 0 }}>{value}</p>
        <p style={{ fontSize: '11px', marginTop: '4px', color: darkMode ? '#6B7280' : '#9ca3af' }}>{label}</p>
      </button>
      
      {/* Dropdown */}
      {showDropdown && dropdownOptions && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '0',
          marginTop: '8px',
          background: darkMode ? 'rgba(25, 28, 40, 0.98)' : 'white',
          borderRadius: '12px',
          border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
          boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          zIndex: 1000,
          minWidth: '140px',
        }}>
          {dropdownOptions.map(option => (
            <button
              key={option}
              onClick={() => onSelectOption(option)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '10px 14px',
                border: 'none',
                background: label === option ? (darkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6') : 'transparent',
                color: darkMode ? '#d1d5db' : '#6b7280',
                cursor: 'pointer',
                fontSize: '13px',
                textAlign: 'left',
              }}
            >
              {option}
              {label === option && <span style={{ color: colors.mint }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Filter Button Component
interface FilterButtonProps {
  icon: React.ReactNode;
  label: string;
  darkMode: boolean;
  expanded: boolean;
  onClick: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ icon, label, darkMode, expanded, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      padding: '10px 12px',
      borderRadius: '16px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      border: expanded ? '2px solid' : '1px solid',
      borderColor: expanded 
        ? (darkMode ? colors.mint : '#a5b4fc')
        : (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)'),
      background: expanded 
        ? (darkMode ? 'rgba(70, 240, 210, 0.15)' : 'rgba(199, 210, 254, 0.5)')
        : (darkMode ? 'rgba(25, 28, 40, 0.7)' : 'rgba(255, 255, 255, 0.5)'),
      color: expanded 
        ? (darkMode ? colors.mint : '#4f46e5')
        : (darkMode ? '#d1d5db' : '#6b7280'),
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
    }}
  >
    {icon}
    <span>{label}</span>
    <svg 
      className="w-3 h-3" 
      style={{ 
        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s',
      }}
      fill="none" viewBox="0 0 24 24" stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </button>
);

// Task Card Component
interface TaskCardProps {
  todo: Todo;
  darkMode: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onCalendarClick: (todo: Todo) => void;
  onStatusChange: (todoId: string, status: string) => void;
  onPriorityChange: (todoId: string, priority: number) => void;
  onActionTypeChange: (todoId: string, actionType: string) => void;
  onDateChange: (todoId: string, date: string) => void;
  onToggleComplete: (todoId: string) => void;
  onCategoryChange: (todoId: string, category: string) => void;
  allCategories: Category[];
  onDescriptionChange?: (todoId: string, description: string) => void;
  onTitleChange?: (todoId: string, title: string) => void;
  onDelete?: (todoId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ todo, darkMode, expanded, onToggleExpand, onCalendarClick, onStatusChange, onPriorityChange, onActionTypeChange, onDateChange, onToggleComplete, onCategoryChange, allCategories, onDescriptionChange = () => {}, onTitleChange = () => {}, onDelete }) => {
  const priority = priorities.find(p => p.level === todo.priority);
  const category = categories.find(c => c.id === todo.category);
  const actionIcons: Record<string, React.ReactNode> = { email: Icons.email, chat: Icons.chat, check: Icons.check, call: Icons.email, document: Icons.email, research: Icons.search };
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showActionDropdown, setShowActionDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showActionTypeDropdown, setShowActionTypeDropdown] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(todo.description || '');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(todo.title || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Long press handlers
  let categoryPressTimer: NodeJS.Timeout | null = null;
  let actionPressTimer: NodeJS.Timeout | null = null;
  let cardPressTimer: NodeJS.Timeout | null = null;

  const handleCardMouseDown = () => {
    cardPressTimer = setTimeout(() => {
      setShowDeleteConfirm(true);
    }, 600);
  };

  const handleCardMouseUp = () => {
    if (cardPressTimer) clearTimeout(cardPressTimer);
  };

  const handleCategoryMouseDown = () => {
    categoryPressTimer = setTimeout(() => {
      setShowCategoryDropdown(true);
      setShowActionTypeDropdown(false);
    }, 500);
  };

  const handleCategoryMouseUp = () => {
    if (categoryPressTimer) clearTimeout(categoryPressTimer);
  };

  const handleActionMouseDown = () => {
    actionPressTimer = setTimeout(() => {
      setShowActionTypeDropdown(true);
      setShowCategoryDropdown(false);
    }, 500);
  };

  const handleActionMouseUp = () => {
    if (actionPressTimer) clearTimeout(actionPressTimer);
  };

  // Speech synthesis toggle
  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const text = `${todo.title}. ${todo.description || ''}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const statusOptions = [
    { id: 'Offen', color: colors.purple },
    { id: 'In Bearbeitung', color: colors.orange },
    { id: 'Auf Rückmeldung', color: colors.skyBlue },
    { id: 'Erledigt', color: colors.mint },
  ];

  const actionOptions = [
    { id: 'email', label: 'E-Mail', icon: Icons.email },
    { id: 'chat', label: 'Gespräch', icon: Icons.chat },
    { id: 'check', label: 'Prüfen', icon: Icons.check },
    { id: 'call', label: 'Anruf', icon: Icons.email },
    { id: 'document', label: 'Dokument', icon: Icons.email },
    { id: 'research', label: 'Recherche', icon: Icons.search },
  ];

  const dateOptions = [
    'Heute', 'Morgen', 'Diese Woche', 'Nächste Woche', 'Diesen Monat', 'Kein Datum'
  ];

  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customDate, setCustomDate] = useState('');

  const currentStatus = statusOptions.find(s => s.id === todo.status) || statusOptions[0];
  const currentAction = actionOptions.find(a => a.id === todo.actionType) || actionOptions[0];

  const closeAllDropdowns = () => {
    setShowStatusDropdown(false);
    setShowPriorityDropdown(false);
    setShowActionDropdown(false);
    setShowDateDropdown(false);
    setShowCalendarPicker(false);
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday = 0
    return { daysInMonth, startingDay };
  };

  const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  const handleDateSelect = (day) => {
    const selectedDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    const formatted = selectedDate.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
    onDateChange(todo.id, formatted);
    setShowCalendarPicker(false);
    setShowDateDropdown(false);
  };

  const hasOpenDropdown = showCategoryDropdown || showActionTypeDropdown || showStatusDropdown || showPriorityDropdown || showActionDropdown || showDateDropdown;

  return (
    <div style={{ position: 'relative', zIndex: hasOpenDropdown || showDeleteConfirm ? 9999 : 1 }}>
    {/* Delete Confirmation Dialog */}
    {showDeleteConfirm && (
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '20px',
      }}>
        <p style={{ color: '#fff', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
          Aufgabe "{todo.title}" löschen?
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'transparent',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >Abbrechen</button>
          <button
            onClick={() => {
              if (onDelete) onDelete(todo.id);
              setShowDeleteConfirm(false);
            }}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              background: colors.coral,
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >Löschen</button>
        </div>
      </div>
    )}
    <GlassCard color={priority.color} darkMode={darkMode}>
      <div 
        style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}
        onMouseDown={handleCardMouseDown}
        onMouseUp={handleCardMouseUp}
        onMouseLeave={handleCardMouseUp}
        onTouchStart={handleCardMouseDown}
        onTouchEnd={handleCardMouseUp}
      >
        {/* Checkbox */}
        <button 
          onClick={() => onToggleComplete(todo.id)}
          style={{
            marginTop: '4px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            border: `2px solid ${todo.completed ? colors.mint : (darkMode ? '#4b5563' : '#D1D5DB')}`,
            background: todo.completed ? colors.mint : 'transparent',
            cursor: 'pointer',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
        >
          {todo.completed && (
            <svg style={{ width: '14px', height: '14px', color: '#1f2937' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap', position: 'relative' }}>
            {/* Category Badge with Long Press */}
            <div style={{ position: 'relative' }}>
              <button
                onMouseDown={handleCategoryMouseDown}
                onMouseUp={handleCategoryMouseUp}
                onMouseLeave={handleCategoryMouseUp}
                onTouchStart={handleCategoryMouseDown}
                onTouchEnd={handleCategoryMouseUp}
                style={{
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: darkMode ? `${category?.color || colors.mint}20` : `${category?.color || colors.mint}25`,
                  color: category?.color || colors.mint,
                  border: darkMode ? `1px solid ${category?.color || colors.mint}30` : 'none',
                  cursor: 'pointer',
                }}
              >
                {category?.label || 'Sonstiges'}
              </button>
              {showCategoryDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '4px',
                  background: darkMode ? 'rgba(25, 28, 40, 0.98)' : 'white',
                  borderRadius: '12px',
                  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                  overflow: 'hidden',
                  zIndex: 9999,
                  minWidth: '120px',
                }}>
                  {allCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => { onCategoryChange(todo.id, cat.id); setShowCategoryDropdown(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '10px 12px',
                        border: 'none',
                        background: todo.category === cat.id ? (darkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6') : 'transparent',
                        color: cat.color,
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                        textAlign: 'left',
                      }}
                    >
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cat.color }} />
                      {cat.label}
                      {todo.category === cat.id && <span style={{ marginLeft: 'auto', color: colors.mint }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Action Type Badge with Long Press */}
            <div style={{ position: 'relative' }}>
              <button
                onMouseDown={handleActionMouseDown}
                onMouseUp={handleActionMouseUp}
                onMouseLeave={handleActionMouseUp}
                onTouchStart={handleActionMouseDown}
                onTouchEnd={handleActionMouseUp}
                style={{
                  padding: '4px 8px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: darkMode ? 'rgba(60,60,90,0.5)' : 'rgba(0,0,0,0.05)',
                  color: darkMode ? '#d1d5db' : '#6b7280',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {actionIcons[todo.actionType]}
                {todo.actionType === 'email' ? 'E-Mail' : todo.actionType === 'chat' ? 'Gespräch' : todo.actionType === 'check' ? 'Prüfen' : todo.actionType === 'call' ? 'Anruf' : todo.actionType === 'document' ? 'Dokument' : 'Recherche'}
              </button>
              {showActionTypeDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '4px',
                  background: darkMode ? 'rgba(25, 28, 40, 0.98)' : 'white',
                  borderRadius: '12px',
                  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                  overflow: 'hidden',
                  zIndex: 9999,
                  minWidth: '130px',
                }}>
                  {actionOptions.map(action => (
                    <button
                      key={action.id}
                      onClick={() => { onActionTypeChange(todo.id, action.id); setShowActionTypeDropdown(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '10px 12px',
                        border: 'none',
                        background: todo.actionType === action.id ? (darkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6') : 'transparent',
                        color: darkMode ? '#d1d5db' : '#6b7280',
                        cursor: 'pointer',
                        fontSize: '13px',
                        textAlign: 'left',
                      }}
                    >
                      {action.icon}
                      {action.label}
                      {todo.actionType === action.id && <span style={{ marginLeft: 'auto', color: colors.mint }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          {expanded && isEditingTitle ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={() => {
                if (editedTitle.trim()) {
                  onTitleChange(todo.id, editedTitle);
                } else {
                  setEditedTitle(todo.title);
                }
                setIsEditingTitle(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (editedTitle.trim()) {
                    onTitleChange(todo.id, editedTitle);
                  } else {
                    setEditedTitle(todo.title);
                  }
                  setIsEditingTitle(false);
                } else if (e.key === 'Escape') {
                  setEditedTitle(todo.title);
                  setIsEditingTitle(false);
                }
              }}
              autoFocus
              style={{
                fontSize: '15px',
                fontWeight: '600',
                color: darkMode ? '#f3f4f6' : '#1f2937',
                margin: 0,
                lineHeight: 1.4,
                background: darkMode ? 'rgba(60,60,90,0.5)' : 'rgba(255,255,255,0.8)',
                border: `2px solid ${colors.mint}`,
                borderRadius: '8px',
                padding: '4px 8px',
                width: '100%',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          ) : (
            <h3 
              onClick={() => {
                if (expanded) {
                  setEditedTitle(todo.title);
                  setIsEditingTitle(true);
                }
              }}
              style={{
                fontSize: '15px',
                fontWeight: '600',
                color: darkMode ? '#f3f4f6' : '#1f2937',
                margin: 0,
                lineHeight: 1.4,
                cursor: expanded ? 'pointer' : 'default',
              }}>
              {todo.title}
            </h3>
          )}

          {/* Meta row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '8px', flexWrap: 'wrap' }}>
            {(() => {
              const statusColors = {
                'Offen': { bg: 'rgba(107, 114, 128, 0.2)', color: '#9ca3af', border: 'rgba(107, 114, 128, 0.3)' },
                'In Bearbeitung': { bg: 'rgba(255, 171, 94, 0.2)', color: colors.orange, border: 'rgba(255, 171, 94, 0.3)' },
                'Auf Rückmeldung': { bg: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)' },
                'Erledigt': { bg: 'rgba(70, 240, 210, 0.2)', color: colors.mint, border: 'rgba(70, 240, 210, 0.3)' },
              };
              const statusStyle = statusColors[todo.status] || statusColors['Offen'];
              return (
                <span style={{
                  padding: '1px 5px',
                  borderRadius: '5px',
                  fontSize: '10px',
                  fontWeight: '500',
                  background: statusStyle.bg,
                  color: statusStyle.color,
                  border: darkMode ? `1px solid ${statusStyle.border}` : 'none',
                }}>
                  {todo.status}
                </span>
              );
            })()}
            <span style={{ 
              fontSize: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '3px',
              color: darkMode ? '#6B7280' : '#9ca3af',
            }}>
              {Icons.calendar}
              {todo.date}
            </span>
            {todo.persons?.map((person, i) => (
              <span key={i} style={{
                padding: '1px 5px',
                borderRadius: '5px',
                fontSize: '10px',
                background: darkMode ? 'rgba(167, 139, 250, 0.15)' : '#f3e8ff',
                color: darkMode ? '#c4b5fd' : '#7c3aed',
                border: darkMode ? '1px solid rgba(167, 139, 250, 0.25)' : 'none',
              }}>
                {person}
              </span>
            ))}
            {todo.meetings?.map((meeting, i) => (
              <span key={i} style={{
                padding: '1px 5px',
                borderRadius: '5px',
                fontSize: '10px',
                background: darkMode ? 'rgba(91, 192, 235, 0.15)' : '#dbeafe',
                color: darkMode ? '#7dd3fc' : '#2563eb',
                border: darkMode ? '1px solid rgba(91, 192, 235, 0.25)' : 'none',
              }}>
                {meeting}
              </span>
            ))}
          </div>

          {/* Expanded Details */}
          {expanded && (
            <div style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: `1px solid ${darkMode ? 'rgba(60,60,90,0.5)' : 'rgba(209,213,219,0.5)'}`,
            }}>
              {(todo.description || expanded) && (
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: darkMode ? '#6B7280' : '#9ca3af' }}>Beschreibung</span>
                  {isEditingDescription ? (
                    <textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      onBlur={() => {
                        onDescriptionChange(todo.id, editedDescription);
                        setIsEditingDescription(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setEditedDescription(todo.description || '');
                          setIsEditingDescription(false);
                        }
                      }}
                      autoFocus
                      style={{
                        width: '100%',
                        fontSize: '14px',
                        marginTop: '4px',
                        padding: '12px',
                        borderRadius: '12px',
                        background: darkMode ? 'rgba(60,60,90,0.5)' : 'rgba(255,255,255,0.8)',
                        color: darkMode ? '#f3f4f6' : '#1f2937',
                        border: `2px solid ${colors.mint}`,
                        lineHeight: 1.5,
                        minHeight: '80px',
                        resize: 'vertical',
                        outline: 'none',
                        fontFamily: 'inherit',
                      }}
                      placeholder="Beschreibung hinzufügen..."
                    />
                  ) : (
                    <p 
                      onClick={() => {
                        setEditedDescription(todo.description || '');
                        setIsEditingDescription(true);
                      }}
                      style={{
                        fontSize: '14px',
                        marginTop: '4px',
                        padding: '12px',
                        borderRadius: '12px',
                        background: darkMode ? 'rgba(60,60,90,0.3)' : 'rgba(255,255,255,0.5)',
                        color: todo.description ? (darkMode ? '#d1d5db' : '#6b7280') : (darkMode ? '#6B7280' : '#9ca3af'),
                        lineHeight: 1.5,
                        cursor: 'pointer',
                        minHeight: '20px',
                      }}>
                      {todo.description || 'Klicken um Beschreibung hinzuzufügen...'}
                    </p>
                  )}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
                {/* Row 1: Priorität + Aktionstyp */}
                <div style={{ position: 'relative' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: darkMode ? '#6B7280' : '#9ca3af' }}>Priorität</span>
                  <button
                    onClick={() => { closeAllDropdowns(); setShowPriorityDropdown(!showPriorityDropdown); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      margin: '4px 0 0',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: `${priority.color}25`,
                      color: priority.color,
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    P{priority.level} - {priority.label}
                    <svg style={{ width: '12px', height: '12px', transform: showPriorityDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showPriorityDropdown && (
                    <div style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: 0,
                      marginBottom: '4px',
                      background: darkMode ? 'rgba(25, 28, 40, 0.98)' : 'white',
                      borderRadius: '12px',
                      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
                      boxShadow: '0 -10px 40px rgba(0,0,0,0.3)',
                      overflow: 'hidden',
                      zIndex: 100,
                      minWidth: '140px',
                    }}>
                      {priorities.map(p => (
                        <button
                          key={p.level}
                          onClick={() => { onPriorityChange(todo.id, p.level); setShowPriorityDropdown(false); }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            width: '100%',
                            padding: '12px 14px',
                            border: 'none',
                            background: todo.priority === p.level ? (darkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6') : 'transparent',
                            color: p.color,
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            textAlign: 'left',
                          }}
                        >
                          P{p.level} - {p.label}
                          {todo.priority === p.level && <span style={{ marginLeft: 'auto', color: colors.mint }}>✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ position: 'relative' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: darkMode ? '#6B7280' : '#9ca3af' }}>Aktionstyp</span>
                  <button
                    onClick={() => { closeAllDropdowns(); setShowActionDropdown(!showActionDropdown); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      margin: '4px 0 0',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: darkMode ? 'rgba(60,60,90,0.5)' : 'rgba(0,0,0,0.05)',
                      color: darkMode ? '#d1d5db' : '#6b7280',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    {currentAction.icon}
                    {currentAction.label}
                    <svg style={{ width: '12px', height: '12px', transform: showActionDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showActionDropdown && (
                    <div style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: 0,
                      marginBottom: '4px',
                      background: darkMode ? 'rgba(25, 28, 40, 0.98)' : 'white',
                      borderRadius: '12px',
                      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
                      boxShadow: '0 -10px 40px rgba(0,0,0,0.3)',
                      overflow: 'hidden',
                      zIndex: 100,
                      minWidth: '140px',
                    }}>
                      {actionOptions.map(action => (
                        <button
                          key={action.id}
                          onClick={() => { onActionTypeChange(todo.id, action.id); setShowActionDropdown(false); }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            width: '100%',
                            padding: '12px 14px',
                            border: 'none',
                            background: todo.actionType === action.id ? (darkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6') : 'transparent',
                            color: darkMode ? '#d1d5db' : '#6b7280',
                            cursor: 'pointer',
                            fontSize: '14px',
                            textAlign: 'left',
                          }}
                        >
                          {action.icon}
                          {action.label}
                          {todo.actionType === action.id && <span style={{ marginLeft: 'auto', color: colors.mint }}>✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Row 2: Status + Fällig */}
                <div style={{ position: 'relative' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: darkMode ? '#6B7280' : '#9ca3af' }}>Status</span>
                  <button
                    onClick={() => { closeAllDropdowns(); setShowStatusDropdown(!showStatusDropdown); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      margin: '4px 0 0',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: `${currentStatus.color}25`,
                      color: currentStatus.color,
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: currentStatus.color }} />
                    {todo.status}
                    <svg style={{ width: '12px', height: '12px', transform: showStatusDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showStatusDropdown && (
                    <div style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: 0,
                      marginBottom: '4px',
                      background: darkMode ? 'rgba(25, 28, 40, 0.98)' : 'white',
                      borderRadius: '12px',
                      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
                      boxShadow: '0 -10px 40px rgba(0,0,0,0.3)',
                      overflow: 'hidden',
                      zIndex: 100,
                      minWidth: '160px',
                    }}>
                      {statusOptions.map(status => (
                        <button
                          key={status.id}
                          onClick={() => { onStatusChange(todo.id, status.id); setShowStatusDropdown(false); }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            width: '100%',
                            padding: '12px 14px',
                            border: 'none',
                            background: todo.status === status.id ? (darkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6') : 'transparent',
                            color: darkMode ? '#f3f4f6' : '#1f2937',
                            cursor: 'pointer',
                            fontSize: '14px',
                            textAlign: 'left',
                          }}
                        >
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: status.color, boxShadow: `0 0 6px ${status.color}60` }} />
                          {status.id}
                          {todo.status === status.id && <span style={{ marginLeft: 'auto', color: colors.mint }}>✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ position: 'relative' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: darkMode ? '#6B7280' : '#9ca3af' }}>Fällig</span>
                  <button
                    onClick={() => { closeAllDropdowns(); setShowDateDropdown(!showDateDropdown); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      margin: '4px 0 0',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: darkMode ? 'rgba(60,60,90,0.5)' : 'rgba(0,0,0,0.05)',
                      color: darkMode ? '#d1d5db' : '#6b7280',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    {Icons.calendar}
                    {todo.date || 'Kein Datum'}
                    <svg style={{ width: '12px', height: '12px', transform: showDateDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showDateDropdown && (
                    <div style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: 0,
                      marginBottom: '4px',
                      background: darkMode ? 'rgba(25, 28, 40, 0.98)' : 'white',
                      borderRadius: '12px',
                      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
                      boxShadow: '0 -10px 40px rgba(0,0,0,0.3)',
                      overflow: 'hidden',
                      zIndex: 100,
                      minWidth: '180px',
                    }}>
                      {dateOptions.map(date => (
                        <button
                          key={date}
                          onClick={() => { onDateChange(todo.id, date); setShowDateDropdown(false); }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            width: '100%',
                            padding: '12px 14px',
                            border: 'none',
                            background: todo.date === date ? (darkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6') : 'transparent',
                            color: darkMode ? '#d1d5db' : '#6b7280',
                            cursor: 'pointer',
                            fontSize: '14px',
                            textAlign: 'left',
                          }}
                        >
                          {date}
                          {todo.date === date && <span style={{ marginLeft: 'auto', color: colors.mint }}>✓</span>}
                        </button>
                      ))}
                      {/* Divider */}
                      <div style={{ 
                        height: '1px', 
                        background: darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
                        margin: '4px 0',
                      }} />
                      {/* Custom date picker trigger */}
                      <button
                        onClick={() => setShowCalendarPicker(!showCalendarPicker)}
                        style={{ 
                          padding: '12px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          cursor: 'pointer',
                          width: '100%',
                          border: 'none',
                          background: 'transparent',
                          textAlign: 'left',
                        }}
                      >
                        <span style={{ color: colors.mint }}>{Icons.calendar}</span>
                        <span style={{ color: darkMode ? '#d1d5db' : '#6b7280', fontSize: '14px' }}>Datum wählen</span>
                      </button>

                      {/* Calendar Picker */}
                      {showCalendarPicker && (
                        <div style={{
                          padding: '12px',
                          borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
                        }}>
                          {/* Month Navigation */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '12px',
                          }}>
                            <button
                              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: colors.mint,
                                cursor: 'pointer',
                                fontSize: '18px',
                                padding: '4px 8px',
                              }}
                            >
                              ‹
                            </button>
                            <span style={{ 
                              color: darkMode ? '#f3f4f6' : '#1f2937', 
                              fontWeight: '600',
                              fontSize: '14px',
                            }}>
                              {monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                            </span>
                            <button
                              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: colors.mint,
                                cursor: 'pointer',
                                fontSize: '18px',
                                padding: '4px 8px',
                              }}
                            >
                              ›
                            </button>
                          </div>

                          {/* Day Names */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            gap: '2px',
                            marginBottom: '8px',
                          }}>
                            {dayNames.map(day => (
                              <div key={day} style={{
                                textAlign: 'center',
                                fontSize: '11px',
                                color: darkMode ? '#6B7280' : '#9ca3af',
                                padding: '4px',
                              }}>
                                {day}
                              </div>
                            ))}
                          </div>

                          {/* Days Grid */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            gap: '2px',
                          }}>
                            {/* Empty cells for days before month starts */}
                            {Array.from({ length: getDaysInMonth(calendarMonth).startingDay }).map((_, i) => (
                              <div key={`empty-${i}`} style={{ padding: '8px' }} />
                            ))}
                            {/* Day buttons */}
                            {Array.from({ length: getDaysInMonth(calendarMonth).daysInMonth }).map((_, i) => {
                              const day = i + 1;
                              const isToday = new Date().toDateString() === new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day).toDateString();
                              return (
                                <button
                                  key={day}
                                  onClick={() => handleDateSelect(day)}
                                  style={{
                                    padding: '8px',
                                    border: 'none',
                                    borderRadius: '8px',
                                    background: isToday ? colors.mint : 'transparent',
                                    color: isToday ? '#1f2937' : (darkMode ? '#d1d5db' : '#6b7280'),
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: isToday ? '600' : '400',
                                  }}
                                >
                                  {day}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {todo.date && (
                <button 
                  onClick={() => onCalendarClick(todo)}
                  style={{
                    marginTop: '16px',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    background: darkMode ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)',
                    color: '#3b82f6',
                    border: 'none',
                    cursor: 'pointer',
                  }}>
                  {Icons.calendar}
                  In Kalender eintragen
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* Unread indicator - only show if unread */}
          {todo.unread && (
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: priority.color,
              boxShadow: darkMode ? `0 0 8px ${priority.color}, 0 0 16px ${priority.color}50` : `0 0 6px ${priority.color}`,
              
            }} />
          )}
          <button 
            onClick={toggleSpeech}
            style={{
              padding: '6px',
              borderRadius: '9999px',
              background: isSpeaking 
                ? (darkMode ? 'rgba(107, 114, 128, 0.5)' : 'rgba(107, 114, 128, 0.3)')
                : 'transparent',
              color: darkMode ? '#6B7280' : '#9ca3af',
              border: isSpeaking ? `2px solid #6B7280` : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}>
            {isSpeaking ? Icons.speakerOff : Icons.speaker}
          </button>
          <button 
            onClick={onToggleExpand}
            style={{
              padding: '4px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: darkMode ? '#6B7280' : '#9ca3af',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          >
            {Icons.chevron}
          </button>
        </div>
      </div>
    </GlassCard>
    </div>
  );
};

// Main App Component
export default function MindFlowApp() {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('tasks');
  const [showAllCategories, setShowAllCategories] = useState<boolean>(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['arbeit', 'privat', 'finanzen', 'gesundheit']);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]); // Track deleted default categories
  const [hiddenPersons, setHiddenPersons] = useState<string[]>([]); // Track deleted default persons
  const [hiddenMeetings, setHiddenMeetings] = useState<string[]>([]); // Track deleted default meetings
  const [hiddenActions, setHiddenActions] = useState<string[]>([]); // Track deleted default actions
  const [addingCategory, setAddingCategory] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newCategoryColor, setNewCategoryColor] = useState<string>(colors.mint);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [todos, setTodos] = useState<Todo[]>([]); // Empty until user logs in
  const [calendarModal, setCalendarModal] = useState<CalendarModalState>({ show: false, todo: null });
  const [dateFilterDropdown, setDateFilterDropdown] = useState<boolean>(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('Heute');
  const [statusFilterDropdown, setStatusFilterDropdown] = useState<boolean>(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('Rückmeldung');
  const [activeStatFilter, setActiveStatFilter] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // User/Auth States
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  
  // Voice Control States
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [voiceInterim, setVoiceInterim] = useState<string>('');
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const [personFilter, setPersonFilter] = useState<string | null>(null);
  const [meetingFilter, setMeetingFilter] = useState<string | null>(null);

  // Custom Items States (Aktionen, Personen, Meetings)
  const [customActions, setCustomActions] = useState<string[]>([]);
  const [customPersons, setCustomPersons] = useState<string[]>([]);
  const [customMeetings, setCustomMeetings] = useState<string[]>([]);
  const [addingAction, setAddingAction] = useState<boolean>(false);
  const [addingPerson, setAddingPerson] = useState<boolean>(false);
  const [addingMeeting, setAddingMeeting] = useState<boolean>(false);
  const [newActionName, setNewActionName] = useState<string>('');
  const [newPersonName, setNewPersonName] = useState<string>('');
  const [newMeetingName, setNewMeetingName] = useState<string>('');

  const dateFilterOptions: string[] = ['Heute', 'Diese Woche', 'Nächste Woche', 'Diesen Monat', 'Alle'];
  const statusFilterOptions: string[] = ['Rückmeldung', 'Offen', 'In Bearbeitung', 'Alle Status'];

  // Default items
  const defaultActions: string[] = ['E-Mail', 'Anruf', 'Gespräch', 'Dokument', 'Recherche', 'Prüfen'];
  const defaultPersons: string[] = ['Sarah', 'Michael', 'Lisa', 'Thomas', 'Anna'];
  const defaultMeetings: string[] = ['Daily Standup', 'Team Weekly', 'Projekt App', 'Quartalsreview'];

  // Combined items (default filtered by hidden + custom)
  const allActions = [...defaultActions.filter(a => !hiddenActions.includes(a)), ...customActions];
  const allPersons = [...defaultPersons.filter(p => !hiddenPersons.includes(p)), ...customPersons];
  const allMeetings = [...defaultMeetings.filter(m => !hiddenMeetings.includes(m)), ...customMeetings];

  // Calculate task counts based on date filter
  const getTaskCountForDateFilter = (filter: string): number => {
    return todos.filter(t => {
      if (t.completed) return false;
      if (filter === 'Alle') return true;
      if (filter === 'Heute') return t.date === 'Heute';
      if (filter === 'Diese Woche') return ['Heute', 'Morgen', 'Diese Woche'].includes(t.date);
      if (filter === 'Nächste Woche') return t.date === 'Nächste Woche';
      if (filter === 'Diesen Monat') return ['Heute', 'Morgen', 'Diese Woche', 'Nächste Woche', 'Diesen Monat'].includes(t.date);
      return false;
    }).length;
  };

  // Calculate task counts based on status filter
  const getTaskCountForStatusFilter = (filter: string): number => {
    return todos.filter(t => {
      if (t.completed) return false;
      if (filter === 'Alle Status') return true;
      if (filter === 'Rückmeldung') return t.status === 'Auf Rückmeldung';
      if (filter === 'Offen') return t.status === 'Offen';
      if (filter === 'In Bearbeitung') return t.status === 'In Bearbeitung';
      return false;
    }).length;
  };

  // Auth handlers
  const handleLogin = async () => {
    if (!authEmail || !authPassword) {
      setAuthError('Bitte E-Mail und Passwort eingeben');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    
    // Simulate login - in production this would call Supabase
    setTimeout(() => {
      // IMPORTANT: Load user data FIRST, before setting user
      // This prevents the auto-save useEffect from overwriting saved data
      loadUserData(authEmail);
      
      // Then set user (this triggers useEffect, but data is already loaded)
      setUser({ email: authEmail });
      
      setShowAuthModal(false);
      setAuthEmail('');
      setAuthPassword('');
      setAuthLoading(false);
    }, 1000);
  };

  const handleRegister = async () => {
    if (!authEmail || !authPassword) {
      setAuthError('Bitte E-Mail und Passwort eingeben');
      return;
    }
    if (authPassword.length < 6) {
      setAuthError('Passwort muss mindestens 6 Zeichen haben');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    
    // Simulate registration - in production this would call Supabase
    setTimeout(() => {
      const newUser = { email: authEmail };
      setUser(newUser);
      
      // Initialize empty data for new user
      const userKey = `mindflow_${authEmail}`;
      const userData = {
        todos: onboardingTodos,
        selectedCategories: ['arbeit', 'privat', 'finanzen', 'gesundheit'],
        customCategories: [],
        hiddenCategories: [],
        hiddenPersons: [],
        hiddenMeetings: [],
        hiddenActions: [],
        customPersons: [],
        customMeetings: [],
        customActions: [],
      };
      localStorage.setItem(userKey, JSON.stringify(userData));
      
      // Load the initial data
      setTodos(onboardingTodos);
      setSelectedCategories(['arbeit', 'privat', 'finanzen', 'gesundheit']);
      setCustomCategories([]);
      setHiddenCategories([]);
      setHiddenPersons([]);
      setHiddenMeetings([]);
      setHiddenActions([]);
      setCustomPersons([]);
      setCustomMeetings([]);
      setCustomActions([]);
      
      setShowAuthModal(false);
      setAuthEmail('');
      setAuthPassword('');
      setAuthLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    // Save current user data before logout
    if (user) {
      const userKey = `mindflow_${user.email}`;
      const userData = {
        todos,
        selectedCategories,
        customCategories,
        hiddenCategories,
        hiddenPersons,
        hiddenMeetings,
        hiddenActions,
        customPersons,
        customMeetings,
        customActions,
      };
      localStorage.setItem(userKey, JSON.stringify(userData));
    }
    
    // Clear user and reset to guest state
    setUser(null);
    setShowProfileDropdown(false);
    
    // Reset to empty/guest state
    setTodos([]);
    setSelectedCategories(['arbeit', 'privat', 'finanzen', 'gesundheit']);
    setCustomCategories([]);
    setHiddenCategories([]);
    setHiddenPersons([]);
    setHiddenMeetings([]);
    setHiddenActions([]);
    setCustomPersons([]);
    setCustomMeetings([]);
    setCustomActions([]);
    setActiveStatFilter(null);
    setSearchQuery('');
    setShowSearch(false);
  };

  // Load user data when logging in
  const loadUserData = (email: string) => {
    const userKey = `mindflow_${email}`;
    console.log('=== Loading user data ===');
    console.log('User key:', userKey);
    
    const savedData = localStorage.getItem(userKey);
    console.log('Saved data exists:', !!savedData);
    
    if (savedData) {
      try {
        const userData = JSON.parse(savedData);
        console.log('Loaded todos count:', userData.todos?.length || 0);
        console.log('Loaded todos:', userData.todos);
        
        setTodos(userData.todos || []);
        setSelectedCategories(userData.selectedCategories || ['arbeit', 'privat', 'finanzen', 'gesundheit']);
        setCustomCategories(userData.customCategories || []);
        setHiddenCategories(userData.hiddenCategories || []);
        setHiddenPersons(userData.hiddenPersons || []);
        setHiddenMeetings(userData.hiddenMeetings || []);
        setHiddenActions(userData.hiddenActions || []);
        setCustomPersons(userData.customPersons || []);
        setCustomMeetings(userData.customMeetings || []);
        setCustomActions(userData.customActions || []);
      } catch (e) {
        console.error('Error loading user data:', e);
      }
    } else {
      console.log('No saved data - initializing with onboarding');
      // New user - initialize with onboarding
      setTodos(onboardingTodos);
      setSelectedCategories(['arbeit', 'privat', 'finanzen', 'gesundheit']);
    }
  };

  // Auto-save user data on changes
  useEffect(() => {
    if (user) {
      const userKey = `mindflow_${user.email}`;
      const userData = {
        todos,
        selectedCategories,
        customCategories,
        hiddenCategories,
        hiddenPersons,
        hiddenMeetings,
        hiddenActions,
        customPersons,
        customMeetings,
        customActions,
      };
      console.log('=== Auto-saving user data ===');
      console.log('User key:', userKey);
      console.log('Saving todos count:', todos.length);
      localStorage.setItem(userKey, JSON.stringify(userData));
    }
  }, [user, todos, selectedCategories, customCategories, hiddenCategories, hiddenPersons, hiddenMeetings, hiddenActions, customPersons, customMeetings, customActions]);

  // Reset to home view - all filters cleared, sorted by priority then date
  // Note: Categories (Arbeit, Privat, etc.) are kept as selected
  const resetToHome = () => {
    setActiveStatFilter(null);
    // Keep selectedCategories as they are - don't reset
    setPersonFilter(null);
    setMeetingFilter(null);
    setSearchQuery('');
    setShowSearch(false);
    setExpandedFilter(null);
    setActiveTab('tasks');
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter tasks based on active stat filter and search
  const getFilteredTasks = (): Todo[] => {
    let filtered = todos.filter(t => !t.completed);
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(query) ||
        (t.description && t.description.toLowerCase().includes(query)) ||
        (t.persons && t.persons.some(p => p.toLowerCase().includes(query))) ||
        (t.meetings && t.meetings.some(m => m.toLowerCase().includes(query)))
      );
    }
    
    // Apply category filter (only if not all categories)
    if (selectedCategories.length > 0 && selectedCategories.length < 4) {
      filtered = filtered.filter(t => selectedCategories.includes(t.category.toLowerCase()));
    }
    
    // Apply person filter (from voice command or filter modal)
    if (personFilter) {
      filtered = filtered.filter(t => 
        t.persons && t.persons.some(p => p.toLowerCase().includes(personFilter.toLowerCase()))
      );
    }
    
    // Apply meeting filter (from voice command or filter modal)
    if (meetingFilter) {
      filtered = filtered.filter(t => 
        t.meetings && t.meetings.some(m => m.toLowerCase().includes(meetingFilter.toLowerCase()))
      );
    }
    
    // Apply stat filter ONLY when a stat card is clicked
    if (activeStatFilter === 'today') {
      filtered = filtered.filter(t => t.date === 'Heute');
    } else if (activeStatFilter === 'critical') {
      filtered = filtered.filter(t => t.priority === 1);
    } else if (activeStatFilter === 'high') {
      filtered = filtered.filter(t => t.priority === 2);
    } else if (activeStatFilter === 'status') {
      if (selectedStatusFilter === 'Rückmeldung') filtered = filtered.filter(t => t.status === 'Auf Rückmeldung');
      else if (selectedStatusFilter === 'Offen') filtered = filtered.filter(t => t.status === 'Offen');
      else if (selectedStatusFilter === 'In Bearbeitung') filtered = filtered.filter(t => t.status === 'In Bearbeitung');
      else if (selectedStatusFilter === 'Erledigt') filtered = filtered.filter(t => t.status === 'Erledigt');
    } else if (activeStatFilter?.startsWith('prio-')) {
      const prioLevel = parseInt(activeStatFilter.replace('prio-', ''));
      filtered = filtered.filter(t => t.priority === prioLevel);
    }
    
    // Sort by priority (1 = highest priority first), then by date within same priority
    const dateOrder: Record<string, number> = {
      'Heute': 1,
      'Morgen': 2,
      'Diese Woche': 3,
      'Nächste Woche': 4,
      'Diesen Monat': 5,
    };
    
    filtered.sort((a, b) => {
      // First sort by priority
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      // Then sort by date within same priority (Heute first)
      const dateA = dateOrder[a.date] || 99;
      const dateB = dateOrder[b.date] || 99;
      return dateA - dateB;
    });
    
    return filtered;
  };

  // Count unread tasks per priority for stat cards
  const unreadCounts = {
    today: todos.filter(t => t.date === 'Heute' && t.unread).length,
    critical: todos.filter(t => t.priority === 1 && t.unread).length,
    high: todos.filter(t => t.priority === 2 && t.unread).length,
    waiting: todos.filter(t => t.status === 'Auf Rückmeldung' && t.unread).length,
  };

  // Mark task as read when expanded
  const handleToggleExpand = (todoId: string) => {
    if (expandedTask === todoId) {
      setExpandedTask(null);
    } else {
      setExpandedTask(todoId);
      // Mark as read
      setTodos(todos.map(t => t.id === todoId ? { ...t, unread: false } : t));
    }
  };

  // Mark all in category as read when stat card clicked
  const handleStatCardClick = (type: string) => {
    let filter: (t: Todo) => boolean;
    if (type === 'today') filter = t => t.date === 'Heute';
    else if (type === 'critical') filter = t => t.priority === 1;
    else if (type === 'high') filter = t => t.priority === 2;
    else if (type === 'waiting') filter = t => t.status === 'Auf Rückmeldung';
    
    // Don't mark as read immediately, just for demo show the filter would work
  };

  // Calendar functions
  const formatDateForCalendar = (dateStr: string): Date => {
    const today = new Date();
    if (dateStr === 'Heute') return today;
    if (dateStr === 'Morgen') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    // Parse "30. Jan." format
    const months: Record<string, number> = { 'Jan': 0, 'Feb': 1, 'März': 2, 'Apr': 3, 'Mai': 4, 'Jun': 5, 'Jul': 6, 'Aug': 7, 'Sep': 8, 'Okt': 9, 'Nov': 10, 'Dez': 11 };
    const match = dateStr.match(/(\d+)\.\s*(\w+)/);
    if (match) {
      const day = parseInt(match[1]);
      const month = months[match[2]] || 0;
      return new Date(today.getFullYear(), month, day);
    }
    return today;
  };

  const formatICSDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const openAppleCalendar = (todo: Todo) => {
    const date = formatDateForCalendar(todo.date);
    const endDate = new Date(date.getTime() + 60 * 60 * 1000); // 1 hour later
    
    // Create ICS content
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatICSDate(date)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${todo.title}
DESCRIPTION:${todo.description || ''}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${todo.title.substring(0, 20)}.ics`;
    link.click();
    URL.revokeObjectURL(url);
    setCalendarModal({ show: false, todo: null });
  };

  const openGoogleCalendar = (todo: Todo) => {
    const date = formatDateForCalendar(todo.date);
    const endDate = new Date(date.getTime() + 60 * 60 * 1000);
    
    const formatGoogleDate = (d: Date): string => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(todo.title)}&dates=${formatGoogleDate(date)}/${formatGoogleDate(endDate)}&details=${encodeURIComponent(todo.description || '')}`;
    
    window.open(url, '_blank');
    setCalendarModal({ show: false, todo: null });
  };

  const downloadICS = (todo: Todo) => {
    openAppleCalendar(todo); // Same function, downloads .ics file
  };

  // Handle status change
  const handleStatusChange = (todoId: string, newStatus: string) => {
    setTodos(todos.map(t => {
      if (t.id === todoId) {
        return { 
          ...t, 
          status: newStatus,
          completed: newStatus === 'Erledigt'
        };
      }
      return t;
    }));
  };

  // Handle checkbox toggle
  const handleToggleComplete = (todoId: string) => {
    setTodos(todos.map(t => {
      if (t.id === todoId) {
        const newCompleted = !t.completed;
        return {
          ...t,
          completed: newCompleted,
          status: newCompleted ? 'Erledigt' : 'Offen'
        };
      }
      return t;
    }));
  };

  // Handle priority change
  const handlePriorityChange = (todoId: string, newPriority: number) => {
    setTodos(todos.map(t => t.id === todoId ? { ...t, priority: newPriority } : t));
  };

  // Handle action type change
  const handleActionTypeChange = (todoId: string, newActionType: string) => {
    setTodos(todos.map(t => t.id === todoId ? { ...t, actionType: newActionType } : t));
  };

  // Handle date change
  const handleDateChange = (todoId: string, newDate: string) => {
    setTodos(todos.map(t => t.id === todoId ? { ...t, date: newDate } : t));
  };

  // Handle category change
  const handleCategoryChange = (todoId: string, newCategory: string) => {
    setTodos(todos.map(t => t.id === todoId ? { ...t, category: newCategory } : t));
  };

  // Handle description change
  const handleDescriptionChange = (todoId: string, newDescription: string) => {
    setTodos(todos.map(t => t.id === todoId ? { ...t, description: newDescription } : t));
  };

  // Handle title change
  const handleTitleChange = (todoId: string, newTitle: string) => {
    setTodos(todos.map(t => t.id === todoId ? { ...t, title: newTitle } : t));
  };

  // Handle delete task
  const handleDeleteTask = (todoId: string) => {
    setTodos(todos.filter(t => t.id !== todoId));
  };

  // Scroll detection
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
      if (window.scrollY > 100 && showAllCategories) {
        setShowAllCategories(false);
      }
      // Close profile dropdown on scroll
      if (showProfileDropdown) {
        setShowProfileDropdown(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAllCategories, showProfileDropdown]);

  // Close profile dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showProfileDropdown) {
        const target = e.target as HTMLElement;
        if (!target.closest('[data-profile-dropdown]')) {
          setShowProfileDropdown(false);
        }
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProfileDropdown]);

  const allCategories = [...categories.filter(c => !hiddenCategories.includes(c.id)), ...customCategories];
  
  const toggleCategory = (catId: string) => {
    if (selectedCategories.includes(catId)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter(c => c !== catId));
      }
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const deleteCategory = (catId: string) => {
    // Check if it's a custom category
    if (customCategories.find(c => c.id === catId)) {
      setCustomCategories(customCategories.filter(c => c.id !== catId));
    } else {
      // It's a default category - add to hidden list
      setHiddenCategories([...hiddenCategories, catId]);
    }
    // Remove from selected categories
    setSelectedCategories(selectedCategories.filter(c => c !== catId));
  };

  const addCategory = () => {
    if (newCategoryName.trim()) {
      const newCat: Category = {
        id: newCategoryName.toLowerCase().replace(/\s/g, '-'),
        label: newCategoryName,
        color: newCategoryColor,
      };
      setCustomCategories([...customCategories, newCat]);
      setSelectedCategories([...selectedCategories, newCat.id]);
      setNewCategoryName('');
      setAddingCategory(false);
      setShowColorPicker(false);
    }
  };

  const colorOptions: string[] = [
    colors.mint, colors.coral, colors.orange, colors.purple, 
    colors.skyBlue, colors.peach, '#4ADE80', '#F472B6'
  ];

  // ============================================
  // VOICE CONTROL IMPLEMENTATION
  // ============================================
  
  // Speech Recognition Reference
  const recognitionRef = React.useRef<any>(null);
  const transcriptRef = React.useRef<string>('');
  
  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'de-DE';
      recognition.continuous = true;  // Keep listening
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      
      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
        setVoiceFeedback(null);
        transcriptRef.current = '';
      };
      
      // Silence timeout - stop after 4 seconds of no speech
      let silenceTimer: NodeJS.Timeout | null = null;
      const SILENCE_TIMEOUT = 4000; // 4 seconds
      
      const resetSilenceTimer = () => {
        if (silenceTimer) clearTimeout(silenceTimer);
        silenceTimer = setTimeout(() => {
          if (recognitionRef.current) {
            recognitionRef.current.stop();
          }
        }, SILENCE_TIMEOUT);
      };
      
      recognition.onend = () => {
        if (silenceTimer) clearTimeout(silenceTimer);
        setIsListening(false);
        // Process the accumulated transcript when recognition ends
        const finalText = transcriptRef.current.trim();
        if (finalText) {
          handleVoiceCommand(finalText);
        }
      };
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        // Reset silence timer on any speech
        resetSilenceTimer();
        
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript + ' ';
          } else {
            interimTranscript += result[0].transcript;
          }
        }
        
        setVoiceInterim(interimTranscript);
        
        // Store complete transcript
        if (finalTranscript.trim()) {
          transcriptRef.current = finalTranscript.trim();
          setVoiceTranscript(finalTranscript.trim());
        }
      };
      
      recognition.onerror = (event: any) => {
        if (silenceTimer) clearTimeout(silenceTimer);
        setIsListening(false);
        let errorMsg = 'Spracherkennung fehlgeschlagen';
        
        switch (event.error) {
          case 'no-speech':
            errorMsg = 'Keine Sprache erkannt. Bitte erneut versuchen.';
            break;
          case 'audio-capture':
            errorMsg = 'Kein Mikrofon gefunden.';
            break;
          case 'not-allowed':
            errorMsg = 'Mikrofon-Zugriff verweigert.';
            break;
          case 'network':
            errorMsg = 'Netzwerkfehler.';
            break;
        }
        
        setVoiceError(errorMsg);
      };
      
      recognitionRef.current = recognition;
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Toggle Voice Recognition
  const toggleVoiceRecognition = () => {
    if (!recognitionRef.current) {
      setVoiceError('Spracherkennung wird nicht unterstützt');
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setVoiceTranscript('');
      setVoiceInterim('');
      setShowVoiceModal(true);
      
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start recognition:', error);
      }
    }
  };

  // Voice Command Parser Helpers
  const parsePriority = (text: string): number | undefined => {
    const lower = text.toLowerCase();
    if (lower.includes('kritisch') || lower.includes('p1') || lower.includes('dringend')) return 1;
    if (lower.includes('hoch') || lower.includes('p2') || lower.includes('wichtig')) return 2;
    if (lower.includes('mittel') || lower.includes('p3')) return 3;
    if (lower.includes('niedrig') || lower.includes('p4')) return 4;
    if (lower.includes('minimal') || lower.includes('p5')) return 5;
    return undefined;
  };

  const parseStatus = (text: string): string | undefined => {
    const lower = text.toLowerCase();
    if (lower.includes('offen') || lower.includes('neu')) return 'Offen';
    if (lower.includes('bearbeitung') || lower.includes('starte') || lower.includes('beginne')) return 'In Bearbeitung';
    if (lower.includes('rückmeldung') || lower.includes('warte')) return 'Auf Rückmeldung';
    if (lower.includes('erledigt') || lower.includes('fertig') || lower.includes('done')) return 'Erledigt';
    return undefined;
  };

  const parseVoiceCategory = (text: string): string | undefined => {
    const lower = text.toLowerCase();
    if (lower.includes('arbeit') || lower.includes('work')) return 'arbeit';
    if (lower.includes('privat') || lower.includes('personal')) return 'privat';
    if (lower.includes('finanz') || lower.includes('geld')) return 'finanzen';
    return undefined;
  };

  const parseDate = (text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes('heute')) return 'Heute';
    if (lower.includes('morgen')) return 'Morgen';
    if (lower.includes('übermorgen')) return 'Übermorgen';
    if (lower.includes('diese woche')) return 'Diese Woche';
    if (lower.includes('nächste woche')) return 'Nächste Woche';
    return 'Heute';
  };

  const parseActionType = (text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes('email') || lower.includes('mail') || lower.includes('schreiben')) return 'email';
    if (lower.includes('anruf') || lower.includes('telefo')) return 'call';
    if (lower.includes('gespräch') || lower.includes('meeting') || lower.includes('besprechen')) return 'chat';
    if (lower.includes('prüfen') || lower.includes('check')) return 'check';
    if (lower.includes('dokument')) return 'document';
    if (lower.includes('recherche') || lower.includes('suchen')) return 'research';
    return 'check';
  };

  // Find todo by search text (fuzzy matching)
  const findTodoByText = (searchText: string): Todo | undefined => {
    const lower = searchText.toLowerCase().trim();
    
    // Exact match first
    let found = todos.find(t => t.title.toLowerCase() === lower);
    if (found) return found;
    
    // Partial match
    found = todos.find(t => t.title.toLowerCase().includes(lower));
    if (found) return found;
    
    // Word matching
    const words = lower.split(' ').filter(w => w.length > 2);
    found = todos.find(t => {
      const titleLower = t.title.toLowerCase();
      return words.some(word => titleLower.includes(word));
    });
    
    return found;
  };

  // Check if command is complex (should use AI)
  const isComplexCommand = (text: string): boolean => {
    const wordCount = text.split(' ').length;
    const lower = text.toLowerCase();
    
    // Simple command patterns (should NOT use AI) - check these FIRST
    const simplePatterns = [
      /^(erledigt|fertig|done|abhaken)/i,
      /^(lösche|entferne|delete)/i,
      /^(zeige|filter|nur)\s*(aufgaben)?\s*(@|#|arbeit|privat|finanz|offen|kritisch)/i,
      /^(alle aufgaben|alles anzeigen|filter zurück)/i,
      /^(suche|such|finde)/i,
      /^@\w+/i,
      /^#\w+/i,
      /priorität\s*(kritisch|hoch|mittel|niedrig)/i,
      /status\s*(offen|bearbeitung|rückmeldung|erledigt)/i,
      /auf\s*(heute|morgen|diese woche|nächste woche)$/i,
      // Voice reading commands - should NOT use AI
      /(lies|lese|vorlesen|sag|nenn|zeig)\s*(mir)?\s*(bitte)?\s*(mal)?\s*(die|alle|meine)?\s*(aufgaben|todos|to-dos|tasks)/i,
      /(was|welche)\s*(sind|habe ich|gibt es)\s*(für)?\s*(aufgaben|todos)/i,
      /(aufgaben|todos).*(vorlesen|lesen|ansagen)/i,
      /(lies|lese|vorlesen).*(heute|hoch|kritisch|priorität|person)/i,
      // Add person/meeting/action to list commands - should NOT use AI
      /(füge|add|neue).*(person|kontakt|meeting|termin|aktion)\s*(hinzu)?/i,
      /(person|kontakt)\s+\w+/i,
      /(meeting|termin)\s+\w+/i,
      /neue\s*(person|kontakt|meeting|termin|aktion)/i,
    ];
    
    const isSimple = simplePatterns.some(pattern => pattern.test(lower));
    
    // If it's a simple command, return false immediately
    if (isSimple) {
      return false;
    }
    
    // Complex indicators (only check if not already identified as simple)
    const hasDescription = lower.includes('beschreibung') || lower.includes('details') || lower.includes('hinzufügen dass');
    const hasMultipleClauses = lower.includes(' und ') || lower.includes(' weil ') || lower.includes(' damit ') || lower.includes(' dass ');
    const isLongText = wordCount > 12;
    
    return hasDescription || hasMultipleClauses || isLongText;
  };

  // Get the currently selected category for new tasks
  const getCurrentCategory = (): string => {
    // Always use the first selected category (works with custom categories too)
    if (selectedCategories.length > 0) {
      return selectedCategories[0];
    }
    // Fallback if nothing selected
    return 'arbeit';
  };

  // Parse complex command with AI (Haiku)
  const parseWithAI = async (text: string): Promise<void> => {
    setVoiceFeedback('🤖 Analysiere...');
    
    try {
      const response = await fetch('/api/parse-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        throw new Error('API Fehler');
      }
      
      const data = await response.json();
      
      // Create todo from AI response
      const newTodo: Todo = {
        id: `voice-ai-${Date.now()}`,
        title: data.title,
        description: data.description || undefined,
        category: data.category || getCurrentCategory(),
        actionType: data.actionType || 'check',
        priority: data.priority || 3,
        status: 'Offen',
        date: data.date || 'Heute',
        persons: data.persons?.length > 0 ? data.persons.map((p: string) => `@${p}`) : undefined,
        meetings: data.meetings?.length > 0 ? data.meetings.map((m: string) => `#${m}`) : undefined,
        unread: true,
        completed: false,
      };
      
      setTodos(prev => [newTodo, ...prev]);
      
      // Build feedback message
      let feedback = `✓ "${newTodo.title}"`;
      if (newTodo.description) feedback += ` mit Beschreibung`;
      if (newTodo.persons?.length) feedback += ` für ${newTodo.persons.join(', ')}`;
      
      setVoiceFeedback(feedback);
      
      setTimeout(() => {
        setShowVoiceModal(false);
        setVoiceFeedback(null);
      }, 2500);
      
    } catch (error) {
      console.error('AI parsing error:', error);
      
      // Fallback: create simple todo without showing error
      const newTodo: Todo = {
        id: `voice-${Date.now()}`,
        title: text.substring(0, 60),
        category: getCurrentCategory(),
        actionType: 'check',
        priority: 3,
        status: 'Offen',
        date: 'Heute',
        unread: true,
        completed: false,
      };
      setTodos(prev => [newTodo, ...prev]);
      setVoiceFeedback(`✓ Aufgabe erstellt: "${newTodo.title}"`);
      
      setTimeout(() => {
        setShowVoiceModal(false);
        setVoiceFeedback(null);
      }, 2000);
    }
  };

  // Main Voice Command Handler
  const handleVoiceCommand = async (text: string) => {
    const lower = text.toLowerCase().trim();
    
    console.log('=== Voice Command Debug ===');
    console.log('Original text:', text);
    console.log('Lowercase:', lower);
    
    // ============ ABSOLUTE PRIORITY: PERSON/MEETING/AKTION HINZUFÜGEN ============
    // These MUST be processed FIRST - no exceptions!
    
    // Check for PERSON command - "füge Person Mia hinzu", "füge Mia hinzu bei Personen", etc.
    const hasPersonKeyword = lower.includes('person');
    console.log('Has person keyword:', hasPersonKeyword);
    
    if (hasPersonKeyword) {
      console.log('>>> Processing PERSON command');
      
      const words = lower.split(/\s+/);
      console.log('Words:', words);
      
      // Find "person" or "personen" in words
      const personIndex = words.findIndex(w => w === 'person' || w === 'personen' || w === 'kontakt' || w === 'kontakte');
      console.log('Person keyword index:', personIndex);
      
      let personName = '';
      
      // Strategy 1: Name is AFTER "person" (e.g., "füge Person Mia hinzu")
      if (personIndex !== -1 && personIndex < words.length - 1) {
        const nextWord = words[personIndex + 1];
        const skipWords = ['hinzu', 'hinzufügen', 'bitte', 'eine', 'einen', 'zur', 'liste', 'erstellen', 'anlegen', 'neue', 'neuen', 'die', 'der', 'das', 'namens', 'mit', 'dem', 'namen', 'an', 'bei'];
        if (!skipWords.includes(nextWord)) {
          personName = nextWord;
          console.log('Strategy 1 - Name after keyword:', personName);
        }
      }
      
      // Strategy 2: Name is BEFORE "person/personen" (e.g., "füge Mia hinzu bei Personen")
      if (!personName) {
        // Look for pattern: "füge X hinzu" where X is the name
        const fügeIndex = words.findIndex(w => w === 'füge' || w === 'add' || w === 'neue' || w === 'neuen');
        if (fügeIndex !== -1 && fügeIndex < words.length - 1) {
          const potentialName = words[fügeIndex + 1];
          const skipWords = ['hinzu', 'hinzufügen', 'bitte', 'eine', 'einen', 'person', 'personen', 'kontakt', 'meeting', 'meetings', 'termin', 'aktion'];
          if (!skipWords.includes(potentialName)) {
            personName = potentialName;
            console.log('Strategy 2 - Name after füge:', personName);
          }
        }
      }
      
      // Clean up the name
      if (personName) {
        personName = personName.replace(/[^a-zäöüßA-ZÄÖÜ]/gi, '');
        console.log('Cleaned person name:', personName);
        
        if (personName && personName.length > 1) {
          const capitalizedName = personName.charAt(0).toUpperCase() + personName.slice(1).toLowerCase();
          const allPersonsList = [...defaultPersons, ...customPersons];
          
          console.log('All persons:', allPersonsList);
          console.log('Adding:', capitalizedName);
          
          if (!allPersonsList.some(p => p.toLowerCase() === personName.toLowerCase())) {
            setCustomPersons(prev => [...prev, capitalizedName]);
            setVoiceFeedback(`✓ @${capitalizedName} zur Personenliste hinzugefügt`);
            console.log('SUCCESS: Person added:', capitalizedName);
            console.log('SUCCESS: Person added:', capitalizedName);
          } else {
            setVoiceFeedback(`ℹ️ @${capitalizedName} existiert bereits`);
            console.log('INFO: Person already exists');
          }
          setTimeout(() => setShowVoiceModal(false), 2000);
          return; // STOP HERE - don't continue to AI
        }
      }
    }
    
    // Check for MEETING command - "füge Meeting Standup hinzu", "füge Standup hinzu bei Meetings", etc.
    const hasMeetingKeyword = lower.includes('meeting') || lower.includes('termin');
    console.log('Has meeting keyword:', hasMeetingKeyword);
    
    if (hasMeetingKeyword) {
      console.log('>>> Processing MEETING command');
      
      const words = lower.split(/\s+/);
      const meetingIndex = words.findIndex(w => w === 'meeting' || w === 'meetings' || w === 'termin' || w === 'termine');
      console.log('Meeting keyword index:', meetingIndex);
      
      let meetingWords: string[] = [];
      const stopWords = ['hinzu', 'hinzufügen', 'bitte', 'erstellen', 'anlegen', 'bei', 'an', 'zu'];
      const skipWords = ['ein', 'eine', 'einen', 'neues', 'neuen', 'zur', 'liste', 'meeting', 'meetings', 'termin', 'termine'];
      
      // Strategy 1: Name is AFTER "meeting" (e.g., "füge Meeting Standup hinzu")
      if (meetingIndex !== -1 && meetingIndex < words.length - 1) {
        for (let i = meetingIndex + 1; i < words.length; i++) {
          const word = words[i].replace(/[^a-zäöüßA-ZÄÖÜ]/gi, '');
          if (stopWords.includes(word.toLowerCase()) || !word) break;
          if (!skipWords.includes(word.toLowerCase())) {
            meetingWords.push(word);
          }
        }
        console.log('Strategy 1 - Words after meeting:', meetingWords);
      }
      
      // Strategy 2: Name is BEFORE "meeting/meetings" (e.g., "füge Standup hinzu bei Meetings")
      if (meetingWords.length === 0) {
        const fügeIndex = words.findIndex(w => w === 'füge' || w === 'add' || w === 'neues' || w === 'neuen');
        if (fügeIndex !== -1) {
          for (let i = fügeIndex + 1; i < words.length; i++) {
            const word = words[i].replace(/[^a-zäöüßA-ZÄÖÜ]/gi, '');
            if (stopWords.includes(word.toLowerCase()) || skipWords.includes(word.toLowerCase()) || !word) break;
            meetingWords.push(word);
          }
          console.log('Strategy 2 - Words after füge:', meetingWords);
        }
      }
      
      if (meetingWords.length > 0) {
        const meetingName = meetingWords.join(' ');
        const capitalizedName = meetingWords.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        const allMeetingsList = [...defaultMeetings, ...customMeetings];
        
        console.log('Adding meeting:', capitalizedName);
        
        if (!allMeetingsList.some(m => m.toLowerCase() === meetingName.toLowerCase())) {
          setCustomMeetings(prev => [...prev, capitalizedName]);
          setVoiceFeedback(`✓ #${capitalizedName} zur Meetingliste hinzugefügt`);
          console.log('SUCCESS: Meeting added:', capitalizedName);
        } else {
          setVoiceFeedback(`ℹ️ #${capitalizedName} existiert bereits`);
        }
        setTimeout(() => setShowVoiceModal(false), 2000);
        return; // STOP HERE
      }
    }
    
    // Check for AKTION command - "füge Aktion Review hinzu", etc.
    // Check for AKTION command - "füge Aktion Review hinzu", "füge Review hinzu bei Aktionen", etc.
    const hasAktionKeyword = lower.includes('aktion');
    console.log('Has aktion keyword:', hasAktionKeyword);
    
    if (hasAktionKeyword) {
      console.log('>>> Processing AKTION command');
      
      const words = lower.split(/\s+/);
      const actionIndex = words.findIndex(w => w === 'aktion' || w === 'aktionen');
      console.log('Action keyword index:', actionIndex);
      
      let actionName = '';
      const skipWords = ['hinzu', 'hinzufügen', 'bitte', 'eine', 'einen', 'zur', 'liste', 'erstellen', 'anlegen', 'neue', 'neuen', 'bei', 'an', 'zu', 'aktion', 'aktionen'];
      
      // Strategy 1: Name is AFTER "aktion" (e.g., "füge Aktion Review hinzu")
      if (actionIndex !== -1 && actionIndex < words.length - 1) {
        const nextWord = words[actionIndex + 1].replace(/[^a-zäöüßA-ZÄÖÜ]/gi, '');
        if (nextWord && !skipWords.includes(nextWord.toLowerCase())) {
          actionName = nextWord;
          console.log('Strategy 1 - Name after aktion:', actionName);
        }
      }
      
      // Strategy 2: Name is BEFORE "aktion/aktionen" (e.g., "füge Review hinzu bei Aktionen")
      if (!actionName) {
        const fügeIndex = words.findIndex(w => w === 'füge' || w === 'add' || w === 'neue' || w === 'neuen');
        if (fügeIndex !== -1 && fügeIndex < words.length - 1) {
          const potentialName = words[fügeIndex + 1].replace(/[^a-zäöüßA-ZÄÖÜ]/gi, '');
          if (potentialName && !skipWords.includes(potentialName.toLowerCase())) {
            actionName = potentialName;
            console.log('Strategy 2 - Name after füge:', actionName);
          }
        }
      }
      
      if (actionName && actionName.length > 1) {
        const capitalizedName = actionName.charAt(0).toUpperCase() + actionName.slice(1).toLowerCase();
        const allActionsList = [...defaultActions, ...customActions];
        
        if (!allActionsList.some(a => a.toLowerCase() === actionName.toLowerCase())) {
          setCustomActions(prev => [...prev, capitalizedName]);
          setVoiceFeedback(`✓ "${capitalizedName}" zur Aktionsliste hinzugefügt`);
          console.log('SUCCESS: Action added:', capitalizedName);
        } else {
          setVoiceFeedback(`ℹ️ "${capitalizedName}" existiert bereits`);
        }
        setTimeout(() => setShowVoiceModal(false), 2000);
        return; // STOP HERE
      }
    }
    
    console.log('>>> No person/meeting/action detected, continuing...');
    
    // ============ CHECK IF COMPLEX → USE AI ============
    if (isComplexCommand(text)) {
      await parseWithAI(text);
      return;
    }
    
    // ============ SIMPLE COMMANDS (LOCAL) ============
    
    // ============ NEUE AUFGABE ERSTELLEN (einfach) ============
    if (lower.match(/^(neue aufgabe|neues todo|erstelle|erstell)\s*[:\s]?\s*\w/i)) {
      const title = text
        .replace(/^(neue aufgabe|neues todo|erstelle|erstell|hinzufügen)\s*[:\s]?\s*/i, '')
        .replace(/\s*(bitte|mal|doch)\s*/gi, ' ')
        .trim();
      
      if (title.length > 2 && title.split(' ').length <= 10) {
        const newTodo: Todo = {
          id: `voice-${Date.now()}`,
          title: title.charAt(0).toUpperCase() + title.slice(1),
          category: parseVoiceCategory(lower) || getCurrentCategory(),
          actionType: parseActionType(lower),
          priority: parsePriority(lower) || 3,
          status: 'Offen',
          date: parseDate(lower),
          unread: true,
          completed: false,
        };
        
        setTodos(prev => [newTodo, ...prev]);
        setVoiceFeedback(`✓ Neue Aufgabe erstellt: "${newTodo.title}"`);
        
        setTimeout(() => {
          setShowVoiceModal(false);
          setVoiceFeedback(null);
        }, 2000);
        
        return;
      } else {
        // Too long for simple parsing, use AI
        await parseWithAI(text);
        return;
      }
    }
    
    // ============ AUFGABE ERLEDIGEN ============
    if (lower.match(/^(erledigt|fertig|done|abhaken|check)\s*/i) || lower.match(/ist\s*(erledigt|fertig|done)$/i)) {
      const searchText = text
        .replace(/^(erledigt|fertig|done|abhaken|check)\s*(bitte)?\s*(die|das|den)?\s*(aufgabe)?\s*[:\s]?\s*/i, '')
        .replace(/\s*(ist\s*)?(erledigt|fertig|done)$/i, '')
        .replace(/\s*(bitte|mal|doch)\s*/gi, ' ')
        .trim();
      
      if (searchText) {
        const found = findTodoByText(searchText);
        if (found) {
          handleToggleComplete(found.id);
          setVoiceFeedback(`✓ "${found.title}" als erledigt markiert`);
        } else {
          setVoiceFeedback(`✗ Aufgabe "${searchText}" nicht gefunden`);
        }
      } else {
        const openTodo = todos.find(t => !t.completed);
        if (openTodo) {
          handleToggleComplete(openTodo.id);
          setVoiceFeedback(`✓ "${openTodo.title}" als erledigt markiert`);
        }
      }
      
      setTimeout(() => setShowVoiceModal(false), 2000);
      return;
    }
    
    // ============ STATUS ÄNDERN ============
    if (lower.match(/(status|setze|ändere).*(auf|zu)\s*(offen|bearbeitung|rückmeldung|erledigt)/i) ||
        lower.match(/(starte|beginne|warte auf)/i)) {
      const newStatus = parseStatus(lower);
      
      if (newStatus) {
        const words = lower.split(' ').filter(w => w.length > 3 && 
          !['status', 'setze', 'ändere', 'bitte', 'auf', 'offen', 'bearbeitung', 'rückmeldung', 'erledigt', 'starte', 'beginne', 'warte'].includes(w));
        
        if (words.length > 0) {
          const found = findTodoByText(words.join(' '));
          if (found) {
            handleStatusChange(found.id, newStatus);
            setVoiceFeedback(`✓ "${found.title}" → ${newStatus}`);
          }
        } else {
          const openTodo = todos.find(t => !t.completed && t.status !== newStatus);
          if (openTodo) {
            handleStatusChange(openTodo.id, newStatus);
            setVoiceFeedback(`✓ "${openTodo.title}" → ${newStatus}`);
          }
        }
      }
      
      setTimeout(() => setShowVoiceModal(false), 2000);
      return;
    }
    
    // ============ PRIORITÄT ÄNDERN ============
    if (lower.match(/(priorität|prio).*(auf|zu|ist)?\s*(kritisch|hoch|mittel|niedrig|minimal|p[1-5])/i) ||
        lower.match(/^(kritisch|hoch|dringend|wichtig)\s*[:\s]/i)) {
      const newPriority = parsePriority(lower);
      
      if (newPriority) {
        const words = lower.split(' ').filter(w => w.length > 3 &&
          !['priorität', 'prio', 'bitte', 'auf', 'zu', 'ist', 'kritisch', 'hoch', 'mittel', 'niedrig', 'minimal', 'dringend', 'wichtig'].includes(w));
        
        if (words.length > 0) {
          const found = findTodoByText(words.join(' '));
          if (found) {
            handlePriorityChange(found.id, newPriority);
            setVoiceFeedback(`✓ "${found.title}" → Priorität ${newPriority}`);
          }
        }
      }
      
      setTimeout(() => setShowVoiceModal(false), 2000);
      return;
    }
    
    // ============ PERSON ZUWEISEN ============
    if (lower.match(/@(\w+)\s*(zu|hinzufügen|bei)/i) || lower.match(/(zu|bei|hinzufügen).*@(\w+)/i)) {
      const personMatch = lower.match(/@(\w+)/i);
      const person = personMatch ? personMatch[1] : null;
      
      if (person) {
        const words = lower.split(' ').filter(w => w.length > 3 && !w.startsWith('@') &&
          !['bitte', 'hinzufügen', 'zu', 'bei'].includes(w));
        
        if (words.length > 0) {
          const found = findTodoByText(words.join(' '));
          if (found) {
            const updatedTodo = {
              ...found,
              persons: [...(found.persons || []), `@${person}`]
            };
            setTodos(prev => prev.map(t => t.id === found.id ? updatedTodo : t));
            setVoiceFeedback(`✓ @${person} zu "${found.title}" hinzugefügt`);
          }
        }
      }
      
      setTimeout(() => setShowVoiceModal(false), 2000);
      return;
    }
    
    // ============ NACH PERSON FILTERN ============
    if (lower.match(/(zeige|filter|nur).*(von|für|mit|@)\s*(\w+)/i) || lower.match(/^@\w+$/i)) {
      const personMatch = lower.match(/@(\w+)/i) || lower.match(/(von|für|mit)\s+(\w+)/i);
      if (personMatch) {
        const person = '@' + (personMatch[1] || personMatch[2]);
        setPersonFilter(person);
        setMeetingFilter(null);
        setSearchQuery(person);
        setShowSearch(true);
        setVoiceFeedback(`🔍 Filter: Aufgaben mit ${person}`);
      }
      
      setTimeout(() => setShowVoiceModal(false), 2000);
      return;
    }
    
    // ============ NACH MEETING FILTERN ============
    if (lower.match(/(zeige|filter).*(meeting|#)\s*(\w+)/i) || lower.match(/^#[\w\s]+$/i)) {
      const meetingMatch = lower.match(/#([\w\s]+)/i) || lower.match(/meeting\s+(\w+)/i);
      if (meetingMatch) {
        const meeting = '#' + meetingMatch[1].trim();
        setMeetingFilter(meeting);
        setPersonFilter(null);
        setSearchQuery(meeting);
        setShowSearch(true);
        setVoiceFeedback(`🔍 Filter: Aufgaben für ${meeting}`);
      }
      
      setTimeout(() => setShowVoiceModal(false), 2000);
      return;
    }
    
    // ============ NACH KATEGORIE FILTERN ============
    if (lower.match(/(zeige|filter|nur)\s*(bitte)?\s*(die)?\s*(aufgaben)?\s*(in|aus|von|kategorie)?\s*(arbeit|privat|finanz)/i)) {
      const category = parseVoiceCategory(lower);
      if (category) {
        setSelectedCategories([category]);
        setVoiceFeedback(`🔍 Filter: Kategorie "${category}"`);
      }
      
      setTimeout(() => setShowVoiceModal(false), 2000);
      return;
    }
    
    // ============ NACH STATUS FILTERN ============
    if (lower.match(/(zeige|filter|nur)\s*(bitte)?\s*(die|mir|alle)?\s*(aufgaben)?\s*(die)?\s*(offen|bearbeitung|rückmeldung|erledigt)/i) ||
        lower.match(/^(offene|erledigte|wartende)\s*(aufgaben)?$/i)) {
      const status = parseStatus(lower);
      if (status) {
        if (status === 'Auf Rückmeldung') {
          setSelectedStatusFilter('Rückmeldung');
        } else if (status === 'In Bearbeitung') {
          setSelectedStatusFilter('In Bearbeitung');
        } else if (status === 'Offen') {
          setSelectedStatusFilter('Offen');
        }
        setActiveStatFilter('status');
        setVoiceFeedback(`🔍 Filter: Status "${status}"`);
      }
      
      setTimeout(() => setShowVoiceModal(false), 2000);
      return;
    }
    
    // ============ NACH PRIORITÄT FILTERN ============
    if (lower.match(/(zeige|filter|nur)\s*(bitte)?\s*(die|mir|alle)?\s*(aufgaben)?\s*(mit)?\s*(kritisch|hoch|wichtig|dringend)/i) ||
        lower.match(/^(kritische|wichtige|dringende)\s*(aufgaben)?$/i)) {
      const priority = parsePriority(lower);
      if (priority === 1) {
        setActiveStatFilter('critical');
        setVoiceFeedback(`🔍 Filter: Kritische Aufgaben`);
      } else if (priority === 2) {
        setActiveStatFilter('high');
        setVoiceFeedback(`🔍 Filter: Hohe Priorität`);
      }
      
      setTimeout(() => setShowVoiceModal(false), 2000);
      return;
    }
    
    // ============ SUCHE ============
    if (lower.match(/^(suche|such|finde|find|wo ist|wo sind)\s*(bitte)?\s*(nach)?\s*/i)) {
      const query = text
        .replace(/^(suche|such|finde|find|wo ist|wo sind)\s*(bitte)?\s*(nach)?\s*/i, '')
        .trim();
      if (query) {
        setSearchQuery(query);
        setShowSearch(true);
        setVoiceFeedback(`🔍 Suche: "${query}"`);
      }
      
      setTimeout(() => setShowVoiceModal(false), 2000);
      return;
    }
    
    // ============ FILTER ZURÜCKSETZEN ============
    if (lower.match(/(alle aufgaben|alles anzeigen|zeige alle|reset|zurücksetzen|filter löschen|filter zurück)/i)) {
      setActiveStatFilter(null);
      setPersonFilter(null);
      setMeetingFilter(null);
      setSearchQuery('');
      setShowSearch(false);
      setSelectedCategories(['arbeit', 'privat', 'finanzen']);
      setVoiceFeedback(`✓ Alle Filter zurückgesetzt`);
      
      setTimeout(() => setShowVoiceModal(false), 2000);
      return;
    }
    
    // ============ AUFGABE LÖSCHEN ============
    if (lower.match(/^(lösche|entferne|delete|remove)\s*(bitte)?\s*(die|das|den)?\s*(aufgabe|todo)?\s*/i)) {
      const searchText = text
        .replace(/^(lösche|entferne|delete|remove)\s*(bitte)?\s*(die|das|den)?\s*(aufgabe|todo)?\s*/i, '')
        .trim();
      
      if (searchText) {
        const found = findTodoByText(searchText);
        if (found) {
          setTodos(prev => prev.filter(t => t.id !== found.id));
          setVoiceFeedback(`✓ "${found.title}" gelöscht`);
        } else {
          setVoiceFeedback(`✗ Aufgabe "${searchText}" nicht gefunden`);
        }
      }
      
      setTimeout(() => setShowVoiceModal(false), 2000);
      return;
    }
    
    // ============ AUFGABEN VORLESEN ============
    if (lower.match(/(lies|lese|vorlesen|sag|nenn|zeig)\s*(mir)?\s*(bitte)?\s*(mal)?\s*(die|alle|meine)?\s*(aufgaben|todos|to-dos|tasks)/i) ||
        lower.match(/(was|welche)\s*(sind|habe ich|gibt es)\s*(für)?\s*(aufgaben|todos|to-dos)/i) ||
        lower.match(/(lies|lese|vorlesen).*?(heute|hoch|kritisch|priorität|person|michael|sarah|lisa|thomas|anna)/i) ||
        lower.match(/(aufgaben|todos).*(vorlesen|lesen|ansagen)/i)) {
      
      let tasksToRead = todos.filter(t => !t.completed);
      let filterDescription = 'alle offenen Aufgaben';
      
      // Check for person filter in command
      const personMatch = lower.match(/(von|für|zu|bei|mit)\s+@?(\w+)/i) || lower.match(/@(\w+)/i);
      if (personMatch) {
        const personName = personMatch[2] || personMatch[1];
        tasksToRead = tasksToRead.filter(t => 
          t.persons && t.persons.some(p => p.toLowerCase().includes(personName.toLowerCase()))
        );
        filterDescription = `Aufgaben für ${personName}`;
      }
      // Check for priority filter in command
      else if (lower.includes('kritisch')) {
        tasksToRead = tasksToRead.filter(t => t.priority === 1);
        filterDescription = 'kritische Aufgaben';
      } else if (lower.includes('hoch') || lower.includes('wichtig') || lower.includes('dringend') || lower.match(/priorität\s*hoch/i)) {
        tasksToRead = tasksToRead.filter(t => t.priority === 2);
        filterDescription = 'Aufgaben mit hoher Priorität';
      } else if (lower.includes('heute')) {
        tasksToRead = tasksToRead.filter(t => t.date === 'Heute');
        filterDescription = 'heutige Aufgaben';
      } else if (lower.includes('morgen')) {
        tasksToRead = tasksToRead.filter(t => t.date === 'Morgen');
        filterDescription = 'morgige Aufgaben';
      } else if (lower.includes('diese woche') || lower.includes('woche')) {
        tasksToRead = tasksToRead.filter(t => ['Heute', 'Morgen', 'Diese Woche'].includes(t.date));
        filterDescription = 'Aufgaben dieser Woche';
      } else if (lower.includes('offen')) {
        tasksToRead = tasksToRead.filter(t => t.status === 'Offen');
        filterDescription = 'offene Aufgaben';
      } else if (lower.includes('rückmeldung') || lower.includes('wartend')) {
        tasksToRead = tasksToRead.filter(t => t.status === 'Auf Rückmeldung');
        filterDescription = 'Aufgaben auf Rückmeldung';
      } else if (lower.includes('bearbeitung')) {
        tasksToRead = tasksToRead.filter(t => t.status === 'In Bearbeitung');
        filterDescription = 'Aufgaben in Bearbeitung';
      }
      
      // Check for meeting filter
      const meetingMatch = lower.match(/(meeting|termin)\s+#?(\w+)/i) || lower.match(/#(\w+)/i);
      if (meetingMatch && !personMatch) {
        const meetingName = meetingMatch[2] || meetingMatch[1];
        tasksToRead = tasksToRead.filter(t => 
          t.meetings && t.meetings.some(m => m.toLowerCase().includes(meetingName.toLowerCase()))
        );
        filterDescription = `Aufgaben für Meeting ${meetingName}`;
      }
      
      // Helper function to speak text (with iOS fix)
      const speakText = (text: string, onEnd?: () => void) => {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'de-DE';
        utterance.rate = 0.9;
        utterance.volume = 1;
        
        if (onEnd) {
          utterance.onend = onEnd;
          utterance.onerror = (e) => {
            console.error('Speech error:', e);
            onEnd(); // Call onEnd even on error
          };
        }
        
        // iOS Safari fix: need to trigger speech in a specific way
        setTimeout(() => {
          window.speechSynthesis.speak(utterance);
          
          // iOS fix: speechSynthesis can pause, so resume it
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        }, 100);
      };
      
      if (tasksToRead.length === 0) {
        setVoiceFeedback(`ℹ️ Keine ${filterDescription} vorhanden`);
        speakText(`Du hast keine ${filterDescription}.`, () => {
          setTimeout(() => setShowVoiceModal(false), 1500);
        });
      } else {
        // Sort by priority
        tasksToRead.sort((a, b) => a.priority - b.priority);
        
        // Build speech text
        const count = tasksToRead.length;
        let speechText = `Du hast ${count} ${filterDescription}: `;
        speechText += tasksToRead.slice(0, 5).map((t, i) => `${i + 1}. ${t.title}`).join('. ');
        if (count > 5) {
          speechText += `. Und ${count - 5} weitere.`;
        }
        
        setVoiceFeedback(`🔊 Lese ${count} Aufgaben vor...`);
        
        speakText(speechText, () => {
          setVoiceFeedback(`✓ ${count} Aufgaben vorgelesen`);
          setTimeout(() => setShowVoiceModal(false), 1500);
        });
        return;
      }
      
      setTimeout(() => setShowVoiceModal(false), 2000);
      return;
    }
    
    // ============ FALLBACK: Use AI for anything else ============
    if (lower.length > 5) {
      await parseWithAI(text);
      return;
    }
    
    // Nichts erkannt
    setVoiceFeedback(`❓ Konnte Befehl nicht verstehen: "${text}"`);
    setTimeout(() => setShowVoiceModal(false), 3000);
  };

  // ============================================
  // END VOICE CONTROL
  // ============================================

  const theme = {
    bg: darkMode ? colors.darkBg : '#F8F8FC',
    text: darkMode ? '#f3f4f6' : '#1f2937',
    textMuted: darkMode ? '#6B7280' : '#9ca3af',
  };

  // Responsive styles injected via style tag
  const responsiveStyles = `
    /* Pulse animation for voice button */
    @keyframes pulse {
      0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 107, 138, 0.7); }
      50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255, 107, 138, 0); }
      100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 107, 138, 0); }
    }

    /* Safe area for notch devices */
    @supports (padding: env(safe-area-inset-bottom)) {
      .mindflow-nav {
        padding-bottom: calc(24px + env(safe-area-inset-bottom)) !important;
      }
      .mindflow-main {
        padding-bottom: calc(100px + env(safe-area-inset-bottom)) !important;
      }
    }

    /* Tablet breakpoint */
    @media (min-width: 768px) {
      .mindflow-container {
        max-width: 700px !important;
      }
      .mindflow-stat-grid {
        gap: 12px !important;
      }
      .mindflow-task-list {
        gap: 16px !important;
      }
      .mindflow-header {
        padding: 48px 32px 16px !important;
      }
      .mindflow-main-content {
        padding: 0 32px !important;
      }
    }

    /* Desktop breakpoint */
    @media (min-width: 1024px) {
      .mindflow-container {
        max-width: 900px !important;
      }
      .mindflow-task-list {
        display: grid !important;
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 20px !important;
      }
      .mindflow-nav-inner {
        max-width: 500px !important;
        margin: 0 auto !important;
      }
      .mindflow-stat-grid {
        gap: 16px !important;
      }
    }

    /* Large desktop */
    @media (min-width: 1280px) {
      .mindflow-container {
        max-width: 1100px !important;
      }
      .mindflow-header {
        padding: 48px 48px 16px !important;
      }
      .mindflow-main-content {
        padding: 0 48px !important;
      }
    }

    /* Extra large desktop */
    @media (min-width: 1536px) {
      .mindflow-container {
        max-width: 1300px !important;
      }
      .mindflow-task-list {
        grid-template-columns: repeat(3, 1fr) !important;
      }
    }

    /* Landscape mode adjustments */
    @media (max-height: 500px) and (orientation: landscape) {
      .mindflow-nav {
        padding: 8px 20px 12px !important;
      }
      .mindflow-main {
        padding-bottom: 80px !important;
      }
    }

    /* Hover effects for desktop */
    @media (hover: hover) {
      .mindflow-task-card:hover {
        transform: translateY(-2px);
        transition: transform 0.2s ease;
      }
    }
  `;

  return (
    <>
      <style>{responsiveStyles}</style>
      {/* Safe area overlay for Dynamic Island - matches dark background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'env(safe-area-inset-top, 47px)',
        background: darkMode ? colors.darkBg : '#F8F8FC',
        zIndex: 100,
      }} />
      <div className="mindflow-main" style={{
        minHeight: '100vh',
        background: theme.bg,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        paddingBottom: '100px',
      }}>
        <div className="mindflow-container" style={{ maxWidth: '430px', margin: '0 auto' }}>
      {/* Background Glows */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute',
          top: '-128px',
          right: '-128px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: colors.mint,
          opacity: darkMode ? 0.12 : 0.20,
          filter: 'blur(100px)',
        }} />
        <div style={{
          position: 'absolute',
          top: '33%',
          left: '-96px',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: colors.purple,
          opacity: darkMode ? 0.10 : 0.18,
          filter: 'blur(100px)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '192px',
          right: '-80px',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: colors.coral,
          opacity: darkMode ? 0.08 : 0.15,
          filter: 'blur(100px)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: '25%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: colors.skyBlue,
          opacity: darkMode ? 0.08 : 0.15,
          filter: 'blur(100px)',
        }} />
      </div>

      {/* Header */}
      <header className="mindflow-header" style={{ position: 'relative', zIndex: 10, padding: '48px 20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <p style={{ fontSize: '14px', color: theme.textMuted, margin: 0 }}>
              {(() => {
                const hour = new Date().getHours();
                if (hour >= 5 && hour < 12) return 'Guten Morgen!';
                if (hour >= 12 && hour < 18) return 'Guten Tag!';
                if (hour >= 18 && hour < 22) return 'Guten Abend!';
                return 'Gute Nacht!';
              })()}
            </p>
            <button 
              onClick={resetToHome}
              style={{ 
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: theme.text, margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                MindFlow
                <svg width="24" height="24" viewBox="0 0 48 48" fill="none" style={{ marginTop: '-2px' }}>
                  <path d="M24 6L24 6C24 6 36 18 36 28C36 34.627 30.627 40 24 40C17.373 40 12 34.627 12 28C12 18 24 6 24 6Z" stroke={colors.mint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 28C20 30.209 21.791 32 24 32" stroke={colors.mint} strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </h1>
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* Lupe / Search */}
            <button 
              onClick={() => setShowSearch(!showSearch)}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                border: `1px solid ${showSearch ? colors.mint : (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)')}`,
                background: showSearch 
                  ? (darkMode ? `${colors.mint}20` : `${colors.mint}30`)
                  : (darkMode ? 'rgba(25, 28, 40, 0.7)' : 'rgba(255,255,255,0.5)'),
                backdropFilter: 'blur(24px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: showSearch ? colors.mint : theme.textMuted,
              }}>
              {Icons.search}
            </button>
            {/* Dark Mode Toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)'}`,
                background: darkMode ? 'rgba(25, 28, 40, 0.7)' : 'rgba(255,255,255,0.5)',
                backdropFilter: 'blur(24px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: darkMode ? '#facc15' : theme.textMuted,
              }}
            >
              {darkMode ? Icons.moon : Icons.sun}
            </button>
            {/* Profile / Login Button */}
            <div style={{ position: 'relative' }} data-profile-dropdown>
              <button 
                onClick={() => {
                  if (user) {
                    setShowProfileDropdown(!showProfileDropdown);
                  } else {
                    setShowAuthModal(true);
                    setAuthMode('login');
                  }
                }}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '16px',
                  border: `1px solid ${user ? colors.mint : (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)')}`,
                  background: user 
                    ? (darkMode ? `${colors.mint}20` : `${colors.mint}30`)
                    : (darkMode ? 'rgba(25, 28, 40, 0.7)' : 'rgba(255,255,255,0.5)'),
                  backdropFilter: 'blur(24px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: user ? colors.mint : theme.textMuted,
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
              
              {/* Profile Dropdown */}
              {showProfileDropdown && user && (
                <div style={{
                  position: 'absolute',
                  top: '56px',
                  right: 0,
                  minWidth: '220px',
                  padding: '12px',
                  borderRadius: '16px',
                  background: darkMode ? 'rgba(25, 28, 40, 0.95)' : 'rgba(255,255,255,0.95)',
                  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
                  backdropFilter: 'blur(24px)',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                  zIndex: 100,
                }}>
                  <div style={{ 
                    padding: '8px 12px', 
                    marginBottom: '8px',
                    borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
                  }}>
                    <p style={{ 
                      fontSize: '12px', 
                      color: theme.textMuted, 
                      margin: '0 0 4px 0' 
                    }}>Angemeldet als</p>
                    <p style={{ 
                      fontSize: '14px', 
                      color: theme.text, 
                      margin: 0,
                      fontWeight: '500',
                      wordBreak: 'break-all',
                    }}>{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: 'none',
                      background: darkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Abmelden
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '16px',
              background: darkMode ? 'rgba(25, 28, 40, 0.8)' : 'rgba(255,255,255,0.7)',
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
              backdropFilter: 'blur(24px)',
            }}>
              <span style={{ color: colors.mint }}>{Icons.search}</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Aufgaben durchsuchen..."
                autoFocus
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '16px',
                  color: darkMode ? '#f3f4f6' : '#1f2937',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: theme.textMuted,
                    padding: '4px',
                  }}
                >
                  ✕
                </button>
              )}
            </div>
            {searchQuery && (
              <p style={{ 
                fontSize: '12px', 
                color: theme.textMuted, 
                marginTop: '8px',
                marginLeft: '4px',
              }}>
                {getFilteredTasks().length} Ergebnis{getFilteredTasks().length !== 1 ? 'se' : ''} für "{searchQuery}"
              </p>
            )}
          </div>
        )}

        {/* Category Pills - Collapsible on scroll */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Show only selected categories when scrolled, all when expanded */}
          {(isScrolled && !showAllCategories 
            ? allCategories.filter(c => selectedCategories.includes(c.id))
            : (showAllCategories ? allCategories : allCategories.filter(c => selectedCategories.includes(c.id)))
          ).map(cat => {
            const isSelected = selectedCategories.includes(cat.id);
            let pressTimer: NodeJS.Timeout | null = null;
            
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                onMouseDown={() => {
                  pressTimer = setTimeout(() => {
                    if (confirm(`"${cat.label}" löschen?`)) {
                      deleteCategory(cat.id);
                    }
                  }, 600);
                }}
                onMouseUp={() => clearTimeout(pressTimer)}
                onMouseLeave={() => clearTimeout(pressTimer)}
                onTouchStart={() => {
                  pressTimer = setTimeout(() => {
                    if (confirm(`"${cat.label}" löschen?`)) {
                      deleteCategory(cat.id);
                    }
                  }, 600);
                }}
                onTouchEnd={() => clearTimeout(pressTimer)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  fontSize: '14px',
                  fontWeight: '600',
                  background: isSelected 
                    ? (darkMode ? `${cat.color}20` : `${cat.color}25`)
                    : (darkMode ? 'rgba(25, 28, 40, 0.7)' : 'rgba(255,255,255,0.5)'),
                  color: isSelected ? cat.color : (darkMode ? '#6B7280' : '#9ca3af'),
                  border: isSelected 
                    ? (darkMode ? `1px solid ${cat.color}30` : 'none')
                    : 'none',
                  cursor: 'pointer',
                  boxShadow: 'none',
                  transition: 'all 0.2s',
                  userSelect: 'none',
                }}
              >
                {cat.label}
              </button>
            );
          })}
          
          {/* + Weitere Button */}
          <button 
            onClick={() => setShowAllCategories(!showAllCategories)}
            style={{
              padding: '6px 12px',
              borderRadius: '9999px',
              fontSize: '14px',
              fontWeight: '500',
              background: showAllCategories ? '#e5e7eb' : (darkMode ? 'rgba(25, 28, 40, 0.7)' : 'rgba(255,255,255,0.5)'),
              color: darkMode ? '#6B7280' : '#9ca3af',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            + Weitere
          </button>

          {/* Add new category button - only when expanded */}
          {showAllCategories && !addingCategory && (
            <button
              onClick={() => setAddingCategory(true)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '9999px',
                background: darkMode ? 'rgba(70, 240, 210, 0.15)' : 'rgba(70, 240, 210, 0.3)',
                color: colors.mint,
                border: `2px dashed ${darkMode ? 'rgba(70, 240, 210, 0.4)' : colors.mint}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              +
            </button>
          )}

          {/* New category input */}
          {showAllCategories && addingCategory && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                placeholder="Name..."
                autoFocus
                style={{
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  fontSize: '14px',
                  border: `2px solid ${newCategoryColor}`,
                  background: darkMode ? 'rgba(25, 28, 40, 0.9)' : 'white',
                  color: darkMode ? '#f3f4f6' : '#1f2937',
                  width: '100px',
                  outline: 'none',
                }}
              />
              {/* Color picker button */}
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: newCategoryColor,
                  border: '2px solid white',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              />
              {/* Confirm */}
              <button
                onClick={addCategory}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: colors.mint,
                  color: '#1f2937',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                }}
              >
                ✓
              </button>
              {/* Cancel */}
              <button
                onClick={() => { setAddingCategory(false); setNewCategoryName(''); setShowColorPicker(false); }}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: darkMode ? 'rgba(60,60,90,0.5)' : '#e5e7eb',
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Color picker dropdown */}
        {showAllCategories && addingCategory && showColorPicker && (
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '16px',
            marginTop: '-12px',
            padding: '12px',
            borderRadius: '16px',
            background: darkMode ? 'rgba(25, 28, 40, 0.9)' : 'white',
            border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
            flexWrap: 'wrap',
          }}>
            {colorOptions.map((color, i) => (
              <button
                key={i}
                onClick={() => { setNewCategoryColor(color); setShowColorPicker(false); }}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: color,
                  border: newCategoryColor === color ? '3px solid white' : '2px solid transparent',
                  cursor: 'pointer',
                  boxShadow: newCategoryColor === color ? '0 0 0 2px ' + color : 'none',
                }}
              />
            ))}
          </div>
        )}

        {/* Stats Cards */}
        <div className="mindflow-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          <StatCard 
            value={getTaskCountForDateFilter(selectedDateFilter)} 
            label={selectedDateFilter} 
            color={colors.mint} 
            darkMode={darkMode} 
            active={activeStatFilter === 'today'}
            hasUnread={unreadCounts.today > 0}
            onClick={() => setActiveStatFilter(activeStatFilter === 'today' ? null : 'today')}
            onLongPress={() => { setStatusFilterDropdown(false); setDateFilterDropdown(!dateFilterDropdown); }}
            showDropdown={dateFilterDropdown}
            dropdownOptions={dateFilterOptions}
            onSelectOption={(option) => {
              setSelectedDateFilter(option);
              setDateFilterDropdown(false);
            }}
          />
          <StatCard 
            value={todos.filter(t => !t.completed && t.priority === 1).length} 
            label="Kritisch" 
            color={colors.coral} 
            darkMode={darkMode} 
            active={activeStatFilter === 'critical'}
            hasUnread={unreadCounts.critical > 0} 
            onClick={() => setActiveStatFilter(activeStatFilter === 'critical' ? null : 'critical')}
          />
          <StatCard 
            value={todos.filter(t => !t.completed && t.priority === 2).length} 
            label="Hoch" 
            color={colors.orange} 
            darkMode={darkMode} 
            active={activeStatFilter === 'high'}
            hasUnread={unreadCounts.high > 0} 
            onClick={() => setActiveStatFilter(activeStatFilter === 'high' ? null : 'high')}
          />
          <StatCard 
            value={getTaskCountForStatusFilter(selectedStatusFilter)} 
            label={selectedStatusFilter} 
            color={colors.purple} 
            darkMode={darkMode} 
            active={activeStatFilter === 'status'}
            hasUnread={unreadCounts.waiting > 0}
            onClick={() => setActiveStatFilter(activeStatFilter === 'status' ? null : 'status')}
            onLongPress={() => { setDateFilterDropdown(false); setStatusFilterDropdown(!statusFilterDropdown); }}
            showDropdown={statusFilterDropdown}
            dropdownOptions={statusFilterOptions}
            onSelectOption={(option) => {
              setSelectedStatusFilter(option);
              setStatusFilterDropdown(false);
            }}
          />
        </div>
      </header>

      {/* Content */}
      <main className="mindflow-main-content" style={{ position: 'relative', zIndex: 1, padding: '0 20px' }}>
        {/* Filter Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '8px' }}>
          <FilterButton 
            icon={Icons.bolt} 
            label="Aktion" 
            darkMode={darkMode}
            expanded={expandedFilter === 'action'}
            onClick={() => setExpandedFilter(expandedFilter === 'action' ? null : 'action')}
          />
          <FilterButton 
            icon={Icons.persons} 
            label="Personen" 
            darkMode={darkMode}
            expanded={expandedFilter === 'persons'}
            onClick={() => setExpandedFilter(expandedFilter === 'persons' ? null : 'persons')}
          />
          <FilterButton 
            icon={Icons.calendar} 
            label="Meetings" 
            darkMode={darkMode}
            expanded={expandedFilter === 'meetings'}
            onClick={() => setExpandedFilter(expandedFilter === 'meetings' ? null : 'meetings')}
          />
        </div>

        {/* Expanded Filter Panels */}
        {expandedFilter === 'action' && (
          <div style={{
            padding: '12px',
            marginBottom: '12px',
            borderRadius: '16px',
            background: darkMode ? 'rgba(255, 171, 94, 0.1)' : 'rgba(255, 251, 235, 0.8)',
            border: `1px solid ${darkMode ? 'rgba(255, 171, 94, 0.3)' : '#fde68a'}`,
            backdropFilter: 'blur(24px)',
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              {allActions.map(action => {
                const isCustom = customActions.includes(action);
                const isDefault = defaultActions.includes(action);
                let pressTimer: NodeJS.Timeout | null = null;
                
                const handleDelete = () => {
                  if (confirm(`"${action}" löschen?`)) {
                    if (isCustom) {
                      setCustomActions(customActions.filter(a => a !== action));
                    } else if (isDefault) {
                      setHiddenActions([...hiddenActions, action]);
                    }
                  }
                };
                
                return (
                <button 
                  key={action} 
                  onMouseDown={() => {
                    pressTimer = setTimeout(handleDelete, 600);
                  }}
                  onMouseUp={() => { if (pressTimer) clearTimeout(pressTimer); }}
                  onMouseLeave={() => { if (pressTimer) clearTimeout(pressTimer); }}
                  onTouchStart={() => {
                    pressTimer = setTimeout(handleDelete, 600);
                  }}
                  onTouchEnd={() => { if (pressTimer) clearTimeout(pressTimer); }}
                  style={{
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: '500',
                  background: darkMode ? 'rgba(255, 171, 94, 0.2)' : 'white',
                  color: darkMode ? colors.orange : '#92400e',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}>
                  {action === 'E-Mail' && Icons.email}
                  {action === 'Gespräch' && Icons.chat}
                  {action === 'Prüfen' && Icons.check}
                  {action}
                </button>
              );
              })}
              {addingAction ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="text"
                    value={newActionName}
                    onChange={(e) => setNewActionName(e.target.value)}
                    placeholder="Neue Aktion..."
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newActionName.trim()) {
                        setCustomActions([...customActions, newActionName.trim()]);
                        setNewActionName('');
                        setAddingAction(false);
                      } else if (e.key === 'Escape') {
                        setAddingAction(false);
                        setNewActionName('');
                      }
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '9999px',
                      fontSize: '13px',
                      border: `1px solid ${colors.orange}`,
                      background: darkMode ? 'rgba(255, 171, 94, 0.1)' : 'white',
                      color: darkMode ? colors.orange : '#92400e',
                      outline: 'none',
                      width: '120px',
                    }}
                  />
                  <button
                    onClick={() => {
                      if (newActionName.trim()) {
                        setCustomActions([...customActions, newActionName.trim()]);
                        setNewActionName('');
                        setAddingAction(false);
                      }
                    }}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: colors.orange,
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >✓</button>
                  <button
                    onClick={() => { setAddingAction(false); setNewActionName(''); }}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'transparent',
                      color: darkMode ? '#6B7280' : '#9ca3af',
                      border: `1px solid ${darkMode ? '#6B7280' : '#9ca3af'}`,
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >✕</button>
                </div>
              ) : (
                <button 
                  onClick={() => setAddingAction(true)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '9999px',
                    background: darkMode ? 'rgba(255, 171, 94, 0.15)' : 'rgba(255, 171, 94, 0.3)',
                    color: darkMode ? colors.orange : '#d97706',
                    border: `2px dashed ${darkMode ? 'rgba(255, 171, 94, 0.4)' : '#fbbf24'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                  }}>+</button>
              )}
            </div>
          </div>
        )}

        {expandedFilter === 'persons' && (
          <div style={{
            padding: '12px',
            marginBottom: '12px',
            borderRadius: '16px',
            background: darkMode ? 'rgba(167, 139, 250, 0.1)' : 'rgba(245, 243, 255, 0.8)',
            border: `1px solid ${darkMode ? 'rgba(167, 139, 250, 0.3)' : '#c4b5fd'}`,
            backdropFilter: 'blur(24px)',
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              {allPersons.map(person => {
                const isCustom = customPersons.includes(person);
                const isDefault = defaultPersons.includes(person);
                let pressTimer: NodeJS.Timeout | null = null;
                
                const handleDelete = () => {
                  if (confirm(`"@${person}" löschen?`)) {
                    if (isCustom) {
                      setCustomPersons(customPersons.filter(p => p !== person));
                    } else if (isDefault) {
                      setHiddenPersons([...hiddenPersons, person]);
                    }
                  }
                };
                
                return (
                <button 
                  key={person} 
                  onClick={() => {
                    setPersonFilter(personFilter === `@${person}` ? null : `@${person}`);
                    setSearchQuery(personFilter === `@${person}` ? '' : `@${person}`);
                  }}
                  onMouseDown={() => {
                    pressTimer = setTimeout(handleDelete, 600);
                  }}
                  onMouseUp={() => { if (pressTimer) clearTimeout(pressTimer); }}
                  onMouseLeave={() => { if (pressTimer) clearTimeout(pressTimer); }}
                  onTouchStart={() => {
                    pressTimer = setTimeout(handleDelete, 600);
                  }}
                  onTouchEnd={() => { if (pressTimer) clearTimeout(pressTimer); }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '9999px',
                    fontSize: '13px',
                    fontWeight: '500',
                    background: personFilter === `@${person}` 
                      ? colors.purple 
                      : darkMode ? 'rgba(167, 139, 250, 0.2)' : 'white',
                    color: personFilter === `@${person}` 
                      ? 'white' 
                      : darkMode ? colors.purple : '#6d28d9',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}>
                  @{person}
                </button>
              );
              })}
              {addingPerson ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="text"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    placeholder="Name..."
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newPersonName.trim()) {
                        setCustomPersons([...customPersons, newPersonName.trim()]);
                        setNewPersonName('');
                        setAddingPerson(false);
                      } else if (e.key === 'Escape') {
                        setAddingPerson(false);
                        setNewPersonName('');
                      }
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '9999px',
                      fontSize: '13px',
                      border: `1px solid ${colors.purple}`,
                      background: darkMode ? 'rgba(167, 139, 250, 0.1)' : 'white',
                      color: darkMode ? colors.purple : '#6d28d9',
                      outline: 'none',
                      width: '100px',
                    }}
                  />
                  <button
                    onClick={() => {
                      if (newPersonName.trim()) {
                        setCustomPersons([...customPersons, newPersonName.trim()]);
                        setNewPersonName('');
                        setAddingPerson(false);
                      }
                    }}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: colors.purple,
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >✓</button>
                  <button
                    onClick={() => { setAddingPerson(false); setNewPersonName(''); }}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'transparent',
                      color: darkMode ? '#6B7280' : '#9ca3af',
                      border: `1px solid ${darkMode ? '#6B7280' : '#9ca3af'}`,
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >✕</button>
                </div>
              ) : (
                <button 
                  onClick={() => setAddingPerson(true)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '9999px',
                    background: darkMode ? 'rgba(167, 139, 250, 0.15)' : 'rgba(167, 139, 250, 0.3)',
                    color: darkMode ? colors.purple : '#7c3aed',
                    border: `2px dashed ${darkMode ? 'rgba(167, 139, 250, 0.4)' : '#a78bfa'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                  }}>+</button>
              )}
            </div>
          </div>
        )}

        {expandedFilter === 'meetings' && (
          <div style={{
            padding: '12px',
            marginBottom: '12px',
            borderRadius: '16px',
            background: darkMode ? 'rgba(91, 192, 235, 0.1)' : 'rgba(239, 246, 255, 0.8)',
            border: `1px solid ${darkMode ? 'rgba(91, 192, 235, 0.3)' : '#93c5fd'}`,
            backdropFilter: 'blur(24px)',
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              {allMeetings.map(meeting => {
                const isCustom = customMeetings.includes(meeting);
                const isDefault = defaultMeetings.includes(meeting);
                let pressTimer: NodeJS.Timeout | null = null;
                
                const handleDelete = () => {
                  if (confirm(`"#${meeting}" löschen?`)) {
                    if (isCustom) {
                      setCustomMeetings(customMeetings.filter(m => m !== meeting));
                    } else if (isDefault) {
                      setHiddenMeetings([...hiddenMeetings, meeting]);
                    }
                  }
                };
                
                return (
                <button 
                  key={meeting} 
                  onClick={() => {
                    setMeetingFilter(meetingFilter === `#${meeting}` ? null : `#${meeting}`);
                    setSearchQuery(meetingFilter === `#${meeting}` ? '' : `#${meeting}`);
                  }}
                  onMouseDown={() => {
                    pressTimer = setTimeout(handleDelete, 600);
                  }}
                  onMouseUp={() => { if (pressTimer) clearTimeout(pressTimer); }}
                  onMouseLeave={() => { if (pressTimer) clearTimeout(pressTimer); }}
                  onTouchStart={() => {
                    pressTimer = setTimeout(handleDelete, 600);
                  }}
                  onTouchEnd={() => { if (pressTimer) clearTimeout(pressTimer); }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '9999px',
                    fontSize: '13px',
                    fontWeight: '500',
                    background: meetingFilter === `#${meeting}` 
                      ? colors.skyBlue 
                      : darkMode ? 'rgba(91, 192, 235, 0.2)' : 'white',
                    color: meetingFilter === `#${meeting}` 
                      ? 'white' 
                      : darkMode ? colors.skyBlue : '#1d4ed8',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}>
                  #{meeting}
                </button>
              );
              })}
              {addingMeeting ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="text"
                    value={newMeetingName}
                    onChange={(e) => setNewMeetingName(e.target.value)}
                    placeholder="Meeting Name..."
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newMeetingName.trim()) {
                        setCustomMeetings([...customMeetings, newMeetingName.trim()]);
                        setNewMeetingName('');
                        setAddingMeeting(false);
                      } else if (e.key === 'Escape') {
                        setAddingMeeting(false);
                        setNewMeetingName('');
                      }
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '9999px',
                      fontSize: '13px',
                      border: `1px solid ${colors.skyBlue}`,
                      background: darkMode ? 'rgba(91, 192, 235, 0.1)' : 'white',
                      color: darkMode ? colors.skyBlue : '#1d4ed8',
                      outline: 'none',
                      width: '130px',
                    }}
                  />
                  <button
                    onClick={() => {
                      if (newMeetingName.trim()) {
                        setCustomMeetings([...customMeetings, newMeetingName.trim()]);
                        setNewMeetingName('');
                        setAddingMeeting(false);
                      }
                    }}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: colors.skyBlue,
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >✓</button>
                  <button
                    onClick={() => { setAddingMeeting(false); setNewMeetingName(''); }}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'transparent',
                      color: darkMode ? '#6B7280' : '#9ca3af',
                      border: `1px solid ${darkMode ? '#6B7280' : '#9ca3af'}`,
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >✕</button>
                </div>
              ) : (
                <button 
                  onClick={() => setAddingMeeting(true)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '9999px',
                    background: darkMode ? 'rgba(91, 192, 235, 0.15)' : 'rgba(91, 192, 235, 0.3)',
                    color: darkMode ? colors.skyBlue : '#2563eb',
                    border: `2px dashed ${darkMode ? 'rgba(91, 192, 235, 0.4)' : '#60a5fa'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                  }}>+</button>
              )}
            </div>
          </div>
        )}

        {/* Task List - Active Tasks */}
        <div className="mindflow-task-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {getFilteredTasks().map(todo => (
            <TaskCard 
              key={todo.id} 
              todo={todo} 
              darkMode={darkMode} 
              expanded={expandedTask === todo.id}
              onToggleExpand={() => handleToggleExpand(todo.id)}
              onCalendarClick={(t) => setCalendarModal({ show: true, todo: t })}
              onStatusChange={handleStatusChange}
              onPriorityChange={handlePriorityChange}
              onActionTypeChange={handleActionTypeChange}
              onDateChange={handleDateChange}
              onToggleComplete={handleToggleComplete}
              onCategoryChange={handleCategoryChange}
              onDescriptionChange={handleDescriptionChange}
              onTitleChange={handleTitleChange}
              onDelete={handleDeleteTask}
              allCategories={[...categories, ...customCategories]}
            />
          ))}
        </div>

        {/* Completed Tasks Section */}
        {todos.filter(t => t.completed).length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: darkMode ? '#6B7280' : '#9ca3af',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <svg style={{ width: '16px', height: '16px', color: colors.mint }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Erledigt ({todos.filter(t => t.completed).length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', opacity: 0.7 }}>
              {todos.filter(t => t.completed).map(todo => (
                <TaskCard 
                  key={todo.id} 
                  todo={todo} 
                  darkMode={darkMode} 
                  expanded={expandedTask === todo.id}
                  onToggleExpand={() => handleToggleExpand(todo.id)}
                  onCalendarClick={(t) => setCalendarModal({ show: true, todo: t })}
                  onStatusChange={handleStatusChange}
                  onPriorityChange={handlePriorityChange}
                  onActionTypeChange={handleActionTypeChange}
                  onDateChange={handleDateChange}
                  onToggleComplete={handleToggleComplete}
                  onCategoryChange={handleCategoryChange}
                  onDescriptionChange={handleDescriptionChange}
                  onTitleChange={handleTitleChange}
                  onDelete={handleDeleteTask}
                  allCategories={[...categories, ...customCategories]}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            background: 'rgba(0,0,0,0.7)',
          }}
          onClick={() => setShowAuthModal(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '380px',
              padding: '32px 24px',
              borderRadius: '24px',
              background: darkMode ? 'rgba(25, 28, 40, 0.98)' : 'rgba(255,255,255,0.98)',
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
              backdropFilter: 'blur(24px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                margin: '0 auto 16px',
                borderRadius: '20px',
                background: `linear-gradient(135deg, ${colors.mint}40, ${colors.purple}40)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
                  <path d="M24 6L24 6C24 6 36 18 36 28C36 34.627 30.627 40 24 40C17.373 40 12 34.627 12 28C12 18 24 6 24 6Z" stroke={colors.mint} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 28C20 30.209 21.791 32 24 32" stroke={colors.mint} strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h2 style={{ 
                fontSize: '22px', 
                fontWeight: '700', 
                color: theme.text, 
                margin: '0 0 4px 0' 
              }}>
                {authMode === 'login' ? 'Willkommen zurück!' : 'Konto erstellen'}
              </h2>
              <p style={{ fontSize: '14px', color: theme.textMuted, margin: 0 }}>
                {authMode === 'login' ? 'Melde dich bei MindFlow an' : 'Registriere dich bei MindFlow'}
              </p>
            </div>

            {/* Error Message */}
            {authError && (
              <div style={{
                padding: '12px',
                marginBottom: '16px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                fontSize: '13px',
                textAlign: 'center',
              }}>
                {authError}
              </div>
            )}

            {/* Email Input */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '13px', 
                fontWeight: '500', 
                color: theme.textMuted,
                marginBottom: '6px',
              }}>E-Mail</label>
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="deine@email.de"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.15)' : '#d1d5db'}`,
                  background: darkMode ? 'rgba(255,255,255,0.05)' : '#f9fafb',
                  color: theme.text,
                  fontSize: '15px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '13px', 
                fontWeight: '500', 
                color: theme.textMuted,
                marginBottom: '6px',
              }}>Passwort</label>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    authMode === 'login' ? handleLogin() : handleRegister();
                  }
                }}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.15)' : '#d1d5db'}`,
                  background: darkMode ? 'rgba(255,255,255,0.05)' : '#f9fafb',
                  color: theme.text,
                  fontSize: '15px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={authMode === 'login' ? handleLogin : handleRegister}
              disabled={authLoading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: `linear-gradient(135deg, ${colors.mint}, ${colors.purple})`,
                color: '#1f2937',
                fontSize: '15px',
                fontWeight: '600',
                cursor: authLoading ? 'not-allowed' : 'pointer',
                opacity: authLoading ? 0.7 : 1,
                marginBottom: '16px',
              }}
            >
              {authLoading ? 'Laden...' : (authMode === 'login' ? 'Anmelden' : 'Registrieren')}
            </button>

            {/* Switch Mode */}
            <p style={{ 
              textAlign: 'center', 
              fontSize: '14px', 
              color: theme.textMuted,
              margin: 0,
            }}>
              {authMode === 'login' ? 'Noch kein Konto? ' : 'Bereits registriert? '}
              <button
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                  setAuthError(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.mint,
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                {authMode === 'login' ? 'Registrieren' : 'Anmelden'}
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      {calendarModal.show && calendarModal.todo && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            background: 'rgba(0,0,0,0.6)',
          }}
          onClick={() => setCalendarModal({ show: false, todo: null })}
        >
          <div 
            style={{
              background: darkMode ? 'rgba(25, 28, 40, 0.95)' : 'white',
              borderRadius: '24px',
              padding: '24px',
              maxWidth: '320px',
              width: '100%',
              backdropFilter: 'blur(24px)',
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ 
              color: darkMode ? '#f3f4f6' : '#1f2937', 
              margin: '0 0 8px 0',
              fontSize: '18px',
              fontWeight: '600',
            }}>
              Kalender auswählen
            </h3>
            <p style={{ 
              color: darkMode ? '#6B7280' : '#9ca3af', 
              margin: '0 0 20px 0',
              fontSize: '14px',
            }}>
              "{calendarModal.todo.title}"
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Apple Calendar */}
              <button
                onClick={() => openAppleCalendar(calendarModal.todo)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: darkMode ? 'rgba(255,255,255,0.08)' : '#f3f4f6',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(180deg, #FF5E5E 0%, #FF2D55 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '18px',
                }}>
                  📅
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ margin: 0, fontWeight: '500', color: darkMode ? '#f3f4f6' : '#1f2937' }}>Apple Kalender</p>
                  <p style={{ margin: 0, fontSize: '12px', color: darkMode ? '#6B7280' : '#9ca3af' }}>iPhone, iPad, Mac</p>
                </div>
              </button>

              {/* Google Calendar */}
              <button
                onClick={() => openGoogleCalendar(calendarModal.todo)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: darkMode ? 'rgba(255,255,255,0.08)' : '#f3f4f6',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(180deg, #4285F4 0%, #34A853 50%, #FBBC05 75%, #EA4335 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '18px',
                }}>
                  📆
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ margin: 0, fontWeight: '500', color: darkMode ? '#f3f4f6' : '#1f2937' }}>Google Kalender</p>
                  <p style={{ margin: 0, fontSize: '12px', color: darkMode ? '#6B7280' : '#9ca3af' }}>Web, Android, iOS</p>
                </div>
              </button>

              {/* Download ICS */}
              <button
                onClick={() => downloadICS(calendarModal.todo)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: darkMode ? 'rgba(255,255,255,0.08)' : '#f3f4f6',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: darkMode ? 'rgba(70, 240, 210, 0.2)' : colors.mint,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: darkMode ? colors.mint : '#1f2937',
                  fontSize: '18px',
                }}>
                  ⬇️
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ margin: 0, fontWeight: '500', color: darkMode ? '#f3f4f6' : '#1f2937' }}>Herunterladen</p>
                  <p style={{ margin: 0, fontSize: '12px', color: darkMode ? '#6B7280' : '#9ca3af' }}>.ics Datei (Outlook, etc.)</p>
                </div>
              </button>
            </div>

            {/* Cancel button */}
            <button
              onClick={() => setCalendarModal({ show: false, todo: null })}
              style={{
                marginTop: '16px',
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                background: 'transparent',
                color: darkMode ? '#6B7280' : '#9ca3af',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* Voice Control Modal */}
      {showVoiceModal && (
        <div 
          onClick={() => {
            if (!isListening) {
              setShowVoiceModal(false);
              setVoiceFeedback(null);
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}>
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: darkMode 
                ? 'linear-gradient(145deg, rgba(25, 28, 40, 0.95), rgba(25, 28, 40, 0.9))'
                : 'rgba(255, 255, 255, 0.95)',
              borderRadius: '24px',
              padding: '32px',
              maxWidth: '350px',
              width: '100%',
              textAlign: 'center',
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
            }}>
            {/* Mic Animation */}
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              borderRadius: '50%',
              background: isListening 
                ? `linear-gradient(135deg, ${colors.coral} 0%, ${colors.orange} 100%)`
                : `linear-gradient(135deg, ${colors.mint}30 0%, ${colors.skyBlue}30 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: isListening ? 'pulse 1.5s ease-in-out infinite' : 'none',
              cursor: 'pointer',
            }}
            onClick={toggleVoiceRecognition}
            >
              <svg style={{ width: '32px', height: '32px', color: isListening ? 'white' : colors.mint }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            
            {/* Status Text */}
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: theme.text, 
              marginBottom: '8px',
            }}>
              {isListening ? 'Ich höre zu...' : 'Sprachsteuerung'}
            </h3>
            
            <p style={{ 
              fontSize: '14px', 
              color: theme.textMuted, 
              marginBottom: '16px',
            }}>
              {isListening 
                ? 'Sag deinen Befehl...' 
                : 'Tippe auf das Mikrofon um zu starten'}
            </p>
            
            {/* Transcript Display */}
            {(voiceTranscript || voiceInterim) && (
              <div style={{
                background: darkMode ? 'rgba(70, 240, 210, 0.1)' : 'rgba(70, 240, 210, 0.15)',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '16px',
                minHeight: '48px',
              }}>
                <p style={{ 
                  fontSize: '16px', 
                  color: theme.text,
                  fontStyle: voiceInterim && !voiceTranscript ? 'italic' : 'normal',
                  opacity: voiceInterim && !voiceTranscript ? 0.7 : 1,
                }}>
                  "{voiceTranscript || voiceInterim}"
                </p>
              </div>
            )}
            
            {/* Feedback Message */}
            {voiceFeedback && (
              <div style={{
                background: voiceFeedback.startsWith('✓') 
                  ? 'rgba(70, 240, 210, 0.2)' 
                  : voiceFeedback.startsWith('✗') 
                    ? 'rgba(255, 107, 138, 0.2)'
                    : 'rgba(255, 171, 94, 0.2)',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '16px',
              }}>
                <p style={{ 
                  fontSize: '14px', 
                  color: voiceFeedback.startsWith('✓') 
                    ? colors.mint 
                    : voiceFeedback.startsWith('✗')
                      ? colors.coral
                      : colors.orange,
                  fontWeight: '500',
                }}>
                  {voiceFeedback}
                </p>
              </div>
            )}
            
            {/* Error Message */}
            {voiceError && (
              <div style={{
                background: 'rgba(255, 107, 138, 0.2)',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '16px',
              }}>
                <p style={{ fontSize: '14px', color: colors.coral }}>
                  {voiceError}
                </p>
              </div>
            )}
            
            {/* Command Examples */}
            {!isListening && !voiceFeedback && (
              <div style={{ textAlign: 'left', marginTop: '16px' }}>
                <p style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '8px', fontWeight: '600' }}>
                  Beispiel-Befehle:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[
                    '"Neue Aufgabe: Bericht schreiben"',
                    '"Erledigt: Angebot senden"',
                    '"Zeige Aufgaben von @Lisa"',
                    '"Kritische Aufgaben"',
                    '"Suche Budget"',
                  ].map((example, i) => (
                    <p key={i} style={{ fontSize: '12px', color: theme.textMuted }}>
                      • {example}
                    </p>
                  ))}
                </div>
              </div>
            )}
            
            {/* Close Button */}
            <button
              onClick={() => {
                if (isListening && recognitionRef.current) {
                  recognitionRef.current.stop();
                }
                setShowVoiceModal(false);
                setVoiceFeedback(null);
                setVoiceError(null);
              }}
              style={{
                marginTop: '20px',
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: 'transparent',
                color: theme.textMuted,
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Schließen
            </button>
          </div>
        </div>
      )}

      {/* Filter View Modal */}
      {activeTab === 'filter' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 60,
          background: darkMode ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
          paddingBottom: '120px',
          overflowY: 'auto',
        }}>
          <div style={{ maxWidth: '430px', margin: '0 auto', width: '100%' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: theme.text }}>Filter</h2>
              <button
                onClick={() => setActiveTab('tasks')}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  border: 'none',
                  cursor: 'pointer',
                  color: theme.text,
                  fontSize: '18px',
                }}
              >✕</button>
            </div>

            {/* Kategorien */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: theme.textMuted, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kategorien</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[...categories, ...customCategories].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      if (selectedCategories.includes(cat.id)) {
                        setSelectedCategories(selectedCategories.filter(c => c !== cat.id));
                      } else {
                        setSelectedCategories([...selectedCategories, cat.id]);
                      }
                    }}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      background: selectedCategories.includes(cat.id) ? cat.color : (darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                      color: selectedCategories.includes(cat.id) ? '#000' : theme.text,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: theme.textMuted, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['Offen', 'In Bearbeitung', 'Auf Rückmeldung', 'Erledigt'].map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      if (selectedStatusFilter === status) {
                        setSelectedStatusFilter('Alle Status');
                        setActiveStatFilter(null);
                      } else {
                        setSelectedStatusFilter(status);
                        setActiveStatFilter('status');
                      }
                    }}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      background: selectedStatusFilter === status ? colors.mint : (darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                      color: selectedStatusFilter === status ? '#000' : theme.text,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Priorität */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: theme.textMuted, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Priorität</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {priorities.map(prio => (
                  <button
                    key={prio.level}
                    onClick={() => {
                      if (activeStatFilter === `prio-${prio.level}`) {
                        setActiveStatFilter(null);
                      } else {
                        setActiveStatFilter(`prio-${prio.level}`);
                      }
                    }}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      background: activeStatFilter === `prio-${prio.level}` ? prio.color : (darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                      color: activeStatFilter === `prio-${prio.level}` ? '#000' : theme.text,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {prio.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Zeitraum */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: theme.textMuted, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Zeitraum</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {dateFilterOptions.map(date => (
                  <button
                    key={date}
                    onClick={() => setSelectedDateFilter(date)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      background: selectedDateFilter === date ? colors.skyBlue : (darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                      color: selectedDateFilter === date ? '#000' : theme.text,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {date}
                  </button>
                ))}
              </div>
            </div>

            {/* Personen */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: theme.textMuted, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Personen</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {allPersons.map(person => (
                  <button
                    key={person}
                    onClick={() => {
                      if (personFilter === `@${person}`) {
                        setPersonFilter(null);
                      } else {
                        setPersonFilter(`@${person}`);
                        setMeetingFilter(null);
                      }
                    }}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      background: personFilter === `@${person}` ? colors.purple : (darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                      color: personFilter === `@${person}` ? '#000' : theme.text,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    @{person}
                  </button>
                ))}
              </div>
            </div>

            {/* Meetings */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: theme.textMuted, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Meetings</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {allMeetings.map(meeting => (
                  <button
                    key={meeting}
                    onClick={() => {
                      if (meetingFilter === `#${meeting}`) {
                        setMeetingFilter(null);
                      } else {
                        setMeetingFilter(`#${meeting}`);
                        setPersonFilter(null);
                      }
                    }}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      background: meetingFilter === `#${meeting}` ? colors.skyBlue : (darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                      color: meetingFilter === `#${meeting}` ? '#000' : theme.text,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    #{meeting}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                setSelectedCategories(['arbeit']);
                setSelectedStatusFilter('Rückmeldung');
                setSelectedDateFilter('Heute');
                setActiveStatFilter(null);
                setPersonFilter(null);
                setMeetingFilter(null);
                setSearchQuery('');
              }}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '600',
                background: 'transparent',
                color: colors.coral,
                border: `1px solid ${colors.coral}`,
                cursor: 'pointer',
                marginBottom: '16px',
              }}
            >
              Filter zurücksetzen
            </button>

            {/* Apply Button */}
            <button
              onClick={() => setActiveTab('tasks')}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '600',
                background: colors.mint,
                color: '#000',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Filter anwenden
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="mindflow-nav" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: '12px 20px 24px',
      }}>
        <div className="mindflow-nav-inner" style={{
          background: darkMode 
            ? 'linear-gradient(145deg, rgba(25, 28, 40, 0.95), rgba(25, 28, 40, 0.85))'
            : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '24px',
          padding: '8px 16px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)'}`,
          boxShadow: '0 -4px 24px rgba(0,0,0,0.2)',
        }}>
          {/* Tasks */}
          <button 
            onClick={() => setActiveTab('tasks')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px 16px',
              borderRadius: '16px',
              background: activeTab === 'tasks' 
                ? (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)')
                : 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: darkMode ? '#6B7280' : '#9ca3af',
            }}
          >
            {Icons.tasks}
            <span style={{ fontSize: '12px', marginTop: '4px' }}>Aufgaben</span>
          </button>

          {/* Voice Button */}
          <button 
            onClick={toggleVoiceRecognition}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px',
              borderRadius: '50%',
              background: isListening 
                ? `linear-gradient(135deg, ${colors.coral} 0%, ${colors.orange} 100%)`
                : darkMode 
                  ? `linear-gradient(135deg, ${colors.mint}40 0%, ${colors.skyBlue}40 100%)`
                  : `linear-gradient(135deg, ${colors.mint}50 0%, ${colors.skyBlue}50 100%)`,
              border: `2px solid ${isListening ? colors.coral : colors.mint}60`,
              cursor: 'pointer',
              color: isListening ? 'white' : colors.mint,
              marginTop: '-8px',
              animation: isListening ? 'pulse 1.5s ease-in-out infinite' : 'none',
            }}>
            {Icons.mic}
          </button>

          {/* Filter */}
          <button 
            onClick={() => setActiveTab('filter')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px 16px',
              borderRadius: '16px',
              background: activeTab === 'filter' 
                ? (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)')
                : 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: darkMode ? '#6B7280' : '#9ca3af',
            }}
          >
            {Icons.filter}
            <span style={{ fontSize: '12px', marginTop: '4px' }}>Filter</span>
          </button>
        </div>
      </nav>
      </div>
    </div>
    </>
  );
}
