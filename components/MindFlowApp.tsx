'use client';

import React, { useState, useEffect } from 'react';

// Extend Window interface for custom properties
declare global {
  interface Window {
    recordingInterval?: NodeJS.Timeout;
  }
}

// ============================================
// DATA MODELS
// ============================================

const priorities = [
  { level: 1, label: 'Kritisch', color: '#FF6B8A', description: 'Sofort' },      // Coral
  { level: 2, label: 'Hoch', color: '#FFAB5E', description: 'Heute' },           // Orange
  { level: 3, label: 'Mittel', color: '#46F0D2', description: 'Diese Woche' },   // Mint
  { level: 4, label: 'Niedrig', color: '#A78BFA', description: 'Diesen Monat' }, // Purple
  { level: 5, label: 'Minimal', color: '#5BC0EB', description: 'Backlog' },      // Sky Blue
];

const categories = [
  { id: 'arbeit', label: 'Arbeit', color: '#46F0D2', isDefault: true },   // Mint
  { id: 'gesundheit', label: 'Gesundheit', color: '#FF6B8A' },            // Coral
  { id: 'privat', label: 'Privat', color: '#A78BFA' },                    // Purple
  { id: 'finanzen', label: 'Finanzen', color: '#5BC0EB' },                // Sky Blue
  { id: 'familie', label: 'Familie', color: '#FFAB5E' },                  // Orange
  { id: 'lernen', label: 'Lernen', color: '#FBE2B4' },                    // Peach
  { id: 'sport', label: 'Sport', color: '#46F0D2' },                      // Mint
  { id: 'reisen', label: 'Reisen', color: '#A78BFA' },                    // Purple
];

const actionTypes = [
  { id: 'email', label: 'E-Mail', icon: 'email' },
  { id: 'anruf', label: 'Anruf', icon: 'phone' },
  { id: 'gespraech', label: 'Gespräch', icon: 'chat' },
  { id: 'dokument', label: 'Dokument', icon: 'document' },
  { id: 'recherche', label: 'Recherche', icon: 'search' },
  { id: 'pruefen', label: 'Prüfen', icon: 'check' },
];

const statusOptions = [
  { id: 'offen', label: 'Offen', color: '#A78BFA' },           // Purple
  { id: 'in_bearbeitung', label: 'In Bearbeitung', color: '#FFAB5E' },  // Orange
  { id: 'warten', label: 'Auf Rückmeldung', color: '#5BC0EB' }, // Sky Blue
  { id: 'erledigt', label: 'Erledigt', color: '#46F0D2' },     // Mint
];

const personTags = [
  { id: 'sarah', name: 'Sarah', department: 'Marketing' },
  { id: 'michael', name: 'Michael', department: 'Entwicklung' },
  { id: 'lisa', name: 'Lisa', department: 'Vertrieb' },
  { id: 'thomas', name: 'Thomas', department: 'Finanzen' },
  { id: 'anna', name: 'Anna', department: 'HR' },
];

const meetingTags = [
  { id: 'daily', name: 'Daily Standup', rhythm: 'Täglich' },
  { id: 'weekly', name: 'Team Weekly', rhythm: 'Wöchentlich' },
  { id: 'projekt-app', name: 'Projekt App', rhythm: 'Wöchentlich' },
  { id: 'quartalsreview', name: 'Quartalsreview', rhythm: 'Quartalsweise' },
];

const themes = {
  light: {
    bg: '#F8F8FC',
    cardBg: 'rgba(255, 255, 255, 0.5)',
    cardBorder: 'rgba(255, 255, 255, 0.6)',
    text: '#1f2937',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
  },
  dark: {
    bg: '#131321',
    cardBg: 'rgba(25, 28, 40, 0.7)',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
    text: '#f3f4f6',
    textSecondary: '#d1d5db',
    textMuted: '#6B7280',
  }
};

// Modern SVG Icons Component
const ActionIcon = ({ type, className = "w-4 h-4" }: { type: string; className?: string }) => {
  const icons = {
    email: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    phone: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
    chat: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="9" cy="7" r="3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 18c0-3 2.5-5 6-5s6 2 6 5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 8h2m2 0h1M16 11h3m1 0h1" />
      </svg>
    ),
    document: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    search: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
    check: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  };
  return icons[type] || null;
};

// Mock Data
const mockTodos = [
  {
    id: '0',
    title: 'KI-Sprachsteuerung für MindFlow',
    description: 'Aktuell hart codierte Schlüsselwörter durch echte KI-Erkennung ersetzen.\n\nOptionen:\n• Claude Haiku 3.5: ~6 Cent/Monat\n• GPT-4o mini: ~1 Cent/Monat\n• Claude Sonnet 4: ~24 Cent/Monat\n\nBei 20 Befehlen/Tag unter 1€/Monat. Ermöglicht natürliche Formulierungen wie "Was muss ich heute noch erledigen?" statt fester Keywords.',
    priority: 4,
    category: 'arbeit',
    actionType: 'entscheidung',
    status: 'offen',
    persons: [],
    meetings: [],
    due_date: null,
    completed: false,
  },
  {
    id: '1',
    title: 'Budget-Freigabe für Q2 Kampagne einholen',
    description: 'Nach Rücksprache mit Sarah festgehalten, dass wir für die Q2 Kampagne ein erhöhtes Budget benötigen. Bitte bei Thomas aus der Finanzabteilung die Freigabe einholen.',
    priority: 2,
    category: 'arbeit',
    actionType: 'gespraech',
    status: 'offen',
    persons: ['sarah', 'thomas'],
    meetings: ['weekly'],
    due_date: '2026-02-15',
    completed: false,
  },
  {
    id: '2',
    title: 'Angebot an Kunde Müller senden',
    description: 'Detailliertes Angebot für die IT-Beratung erstellen und per E-Mail senden. Umfang: 3 Beratertage, Schwerpunkt Cloud-Migration.',
    priority: 1,
    category: 'arbeit',
    actionType: 'email',
    status: 'offen',
    persons: ['lisa'],
    meetings: [],
    due_date: '2026-01-30',
    completed: false,
  },
  {
    id: '3',
    title: 'Quartalszahlen prüfen und Bericht erstellen',
    description: 'Die Controlling-Abteilung hat die vorläufigen Q4-Zahlen geliefert. Bitte auf Plausibilität prüfen und Abweichungen dokumentieren.',
    priority: 2,
    category: 'arbeit',
    actionType: 'pruefen',
    status: 'in_bearbeitung',
    persons: ['thomas'],
    meetings: ['quartalsreview'],
    due_date: '2026-01-31',
    completed: false,
  },
  {
    id: '4',
    title: 'Zahnarzt-Termin vereinbaren',
    description: 'Halbjährliche Kontrolluntersuchung ist fällig. Praxis Dr. Schmidt anrufen.',
    priority: 4,
    category: 'gesundheit',
    actionType: 'anruf',
    status: 'offen',
    persons: [],
    meetings: [],
    due_date: '2026-02-20',
    completed: false,
  },
  {
    id: '5',
    title: 'Neue Mitarbeiterin einarbeiten',
    description: 'Anna aus HR hat Lisa als neue Kollegin im Vertrieb angekündigt. Einarbeitungsplan erstellen und Willkommensgespräch führen.',
    priority: 2,
    category: 'arbeit',
    actionType: 'gespraech',
    status: 'warten',
    persons: ['anna', 'lisa'],
    meetings: ['daily'],
    due_date: '2026-02-01',
    completed: false,
  },
  {
    id: '6',
    title: 'Steuerunterlagen zusammenstellen',
    description: 'Alle relevanten Belege und Dokumente für die Steuererklärung 2025 sammeln und sortieren.',
    priority: 3,
    category: 'finanzen',
    actionType: 'dokument',
    status: 'offen',
    persons: [],
    meetings: [],
    due_date: '2026-03-15',
    completed: false,
  },
];

// ============================================
// COMPONENTS
// ============================================

function TodoCard({ todo, onToggle, onSelectPerson, onSelectMeeting, onDelete, darkMode, theme }: { todo: any; onToggle: any; onSelectPerson: any; onSelectMeeting: any; onDelete: any; darkMode: boolean; theme: any }) {
  const [expanded, setExpanded] = useState(false);
  const pressTimerRef = React.useRef<any>(null);
  const longPressTriggered = React.useRef<boolean>(false);
  
  const priority = priorities.find((p: any) => p.level === todo.priority);
  const category = categories.find((c: any) => c.id === todo.category);
  const action = actionTypes.find((a: any) => a.id === todo.actionType);
  const status = statusOptions.find((s: any) => s.id === todo.status);
  const todoPersons = personTags.filter((p: any) => todo.persons.includes(p.id));
  const todoMeetings = meetingTags.filter((m: any) => todo.meetings.includes(m.id));

  const formatDate = (date: string | null) => {
    if (!date) return null;
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (d.toDateString() === today.toDateString()) return 'Heute';
    if (d.toDateString() === tomorrow.toDateString()) return 'Morgen';
    return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
  };

  const handleMouseDown = () => {
    longPressTriggered.current = false;
    pressTimerRef.current = setTimeout(() => {
      longPressTriggered.current = true;
      onDelete(todo);
    }, 600);
  };

  const handleMouseUp = () => {
    clearTimeout(pressTimerRef.current);
  };

  const handleClick = () => {
    if (longPressTriggered.current) {
      longPressTriggered.current = false;
      return;
    }
    setExpanded(!expanded);
  };

  return (
    <div 
      className={`relative rounded-2xl overflow-hidden transition-all select-none ${todo.completed ? 'opacity-50' : ''}`}
      style={{ 
        background: darkMode 
          ? `linear-gradient(145deg, rgba(25, 28, 40, 0.8), rgba(25, 28, 40, 0.6))`
          : theme.cardBg,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid ${darkMode ? `${priority?.color}20` : theme.cardBorder}`,
        boxShadow: darkMode 
          ? `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`
          : '0 4px 16px rgba(0,0,0,0.1)',
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      {/* Background color glow */}
      {darkMode && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(ellipse at 0% 50%, ${priority?.color}12 0%, transparent 50%)`,
          pointerEvents: 'none',
        }} />
      )}
      
      {/* Left accent line - short, not full height */}
      {darkMode && (
        <div style={{
          position: 'absolute',
          left: '0',
          top: '20px',
          bottom: '20px',
          width: '3px',
          background: `linear-gradient(180deg, ${priority?.color}90 0%, ${priority?.color}40 100%)`,
          borderRadius: '0 3px 3px 0',
          boxShadow: `0 0 15px ${priority?.color}60, 0 0 30px ${priority?.color}30`,
        }} />
      )}
      
      <div className="relative p-4" style={{ paddingLeft: darkMode ? '20px' : '16px' }}>
        <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={(e) => onToggle(todo.id, e)}
          className="mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0"
          style={{ 
            backgroundColor: todo.completed ? priority?.color : 'transparent',
            borderColor: todo.completed ? 'transparent' : darkMode ? '#4b5563' : '#D1D5DB'
          }}
        >
          {todo.completed && (
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Top row: Category + Action Type */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span 
              className="px-2.5 py-1 rounded-full text-xs font-semibold text-gray-800"
              style={{ backgroundColor: category?.color }}
            >
              {category?.label}
            </span>
            {action && (
              <span 
                className="px-2 py-1 rounded-full text-xs flex items-center gap-1.5"
                style={{ 
                  backgroundColor: darkMode ? 'rgba(60,60,90,0.5)' : 'rgba(255,255,255,0.6)',
                  color: theme.textSecondary
                }}
              >
                <ActionIcon type={action.icon} className="w-3.5 h-3.5" />
                {action.label}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 
            className={`font-semibold leading-snug ${todo.completed ? 'line-through' : ''}`}
            style={{ color: todo.completed ? theme.textMuted : theme.text }}
          >
            {todo.title}
          </h3>

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {/* Status */}
            <span 
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: `${status?.color}40`, color: theme.text }}
            >
              {status?.label}
            </span>
            
            {/* Due date */}
            {todo.due_date && (
              <span className="text-xs flex items-center gap-1" style={{ color: theme.textMuted }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(todo.due_date)}
              </span>
            )}

            {/* Person Tags */}
            {todoPersons.map(person => (
              <button
                key={person.id}
                onClick={() => onSelectPerson(person.id)}
                className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
              >
                @{person.name}
              </button>
            ))}

            {/* Meeting Tags */}
            {todoMeetings.map(meeting => (
              <button
                key={meeting.id}
                onClick={() => onSelectMeeting(meeting.id)}
                className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
              >
                #{meeting.name}
              </button>
            ))}
          </div>
        </div>

        {/* Priority indicator */}
        <div 
          className="w-3 h-3 rounded-full flex-shrink-0 mt-2"
          style={{ backgroundColor: priority?.color }}
          title={`P${priority?.level} - ${priority?.label}`}
        />
        
        {/* Speaker button for audio playback */}
        <button 
          onClick={() => {
            const personNames = todoPersons.map((p: any) => p.name).join(', ');
            const meetingNames = todoMeetings.map((m: any) => m.name).join(', ');
            
            let text = todo.title;
            if (todo.description) text += `. ${todo.description}`;
            text += `. Priorität ${priority?.level}, ${priority?.label}.`;
            text += ` Kategorie: ${category?.label}.`;
            text += ` Aktion: ${action?.label}.`;
            if (personNames) text += ` Personen: ${personNames}.`;
            if (meetingNames) text += ` Meetings: ${meetingNames}.`;
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'de-DE';
            speechSynthesis.speak(utterance);
          }}
          className="p-1.5 rounded-full transition-all hover:scale-110 active:scale-95"
          style={{ 
            backgroundColor: darkMode ? 'rgba(60,60,90,0.5)' : 'rgba(196,181,253,0.3)',
            color: darkMode ? '#46F0D2' : '#7c3aed'
          }}
          title="Vorlesen"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        </button>
        
        {/* Expand button */}
        <button 
          onClick={handleClick} 
          className="p-1 transition-colors"
          style={{ color: theme.textMuted }}
        >
          <svg className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div 
          className="mt-4 pt-4 border-t"
          style={{ borderColor: darkMode ? 'rgba(60,60,90,0.5)' : 'rgba(209,213,219,0.5)' }}
        >
          {/* Description */}
          {todo.description && (
            <div className="mb-4">
              <span className="text-xs uppercase" style={{ color: theme.textMuted }}>Beschreibung</span>
              <p 
                className="text-sm mt-1 leading-relaxed rounded-xl p-3"
                style={{ 
                  backgroundColor: darkMode ? 'rgba(60,60,90,0.3)' : 'rgba(255,255,255,0.5)',
                  color: theme.textSecondary
                }}
              >
                {todo.description}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-xs uppercase" style={{ color: theme.textMuted }}>Priorität</span>
              <p className="font-medium" style={{ color: priority?.color }}>P{priority?.level} - {priority?.label}</p>
            </div>
            <div>
              <span className="text-xs uppercase" style={{ color: theme.textMuted }}>Aktionstyp</span>
              <p className="flex items-center gap-1.5" style={{ color: theme.textSecondary }}>
                <ActionIcon type={action?.icon} className="w-4 h-4" /> {action?.label}
              </p>
            </div>
            <div>
              <span className="text-xs uppercase" style={{ color: theme.textMuted }}>Status</span>
              <p style={{ color: theme.textSecondary }}>{status?.label}</p>
            </div>
            <div>
              <span className="text-xs uppercase" style={{ color: theme.textMuted }}>Fällig</span>
              <p style={{ color: theme.textSecondary }}>{formatDate(todo.due_date) || '–'}</p>
            </div>
          </div>
          
          {/* Calendar Integration Button */}
          {todo.due_date && (
            <button 
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ 
                backgroundColor: darkMode ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)',
                color: '#3b82f6'
              }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              In Kalender eintragen
            </button>
          )}
        </div>
      )}
      </div>
    </div>
  );
}

// ============================================
// MAIN APP
// ============================================

export default function MindFlowApp({ userId, userEmail }: { userId?: string; userEmail?: string | null }) {
  const [activeTab, setActiveTab] = useState('tasks');
  const [todos, setTodos] = useState(mockTodos);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['arbeit']);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [selectedPersons, setSelectedPersons] = useState<string[]>([]);
  const [selectedMeetings, setSelectedMeetings] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<number | null>(null);
  const [selectedToday, setSelectedToday] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null); // null, 'offen', 'in_bearbeitung', 'warten', 'completed'
  
  // Dark Mode
  const [darkMode, setDarkMode] = useState(false);
  const theme = darkMode ? themes.dark : themes.light;
  
  // Custom items
  const [customActions, setCustomActions] = useState<any[]>([]);
  const [customPersons, setCustomPersons] = useState<any[]>([]);
  const [customMeetings, setCustomMeetings] = useState<any[]>([]);
  
  // Deleted default items
  const [deletedActions, setDeletedActions] = useState<string[]>([]);
  const [deletedPersons, setDeletedPersons] = useState<string[]>([]);
  const [deletedMeetings, setDeletedMeetings] = useState<string[]>([]);
  
  // Add new item mode
  const [addingAction, setAddingAction] = useState(false);
  const [addingPerson, setAddingPerson] = useState(false);
  const [addingMeeting, setAddingMeeting] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  
  // Combined lists (filter out deleted defaults)
  const allActions = [...actionTypes.filter((a: any) => !deletedActions.includes(a.id)), ...customActions];
  const allPersons = [...personTags.filter((p: any) => !deletedPersons.includes(p.id)), ...customPersons];
  const allMeetings = [...meetingTags.filter((m: any) => !deletedMeetings.includes(m.id)), ...customMeetings];
  
  // Voice Recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  
  // Confirmation Modal
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingTodo, setPendingTodo] = useState<any>(null);
  
  // Celebration
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Long press timer ref
  const pressTimerRef = React.useRef<any>(null);
  const longPressTriggered = React.useRef<boolean>(false);
  
  // Close expanded section on scroll
  React.useEffect(() => {
    const handleScroll = () => {
      if (expandedSection) {
        setExpandedSection(null);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [expandedSection]);
  
  // Delete confirmation modal
  const [deleteModal, setDeleteModal] = useState({ show: false, type: null, id: null, name: '', step: 1, hasAssignments: false });
  
  // Delete todo modal
  const [deleteTodoModal, setDeleteTodoModal] = useState({ show: false, todo: null });

  // Recording timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = () => {
    setIsRecording(true);
    setLiveTranscript('');
    
    const phrases = [
      'Nach Rücksprache',
      'Nach Rücksprache mit Kollegin Müller',
      'Nach Rücksprache mit Kollegin Müller festgehalten,',
      'Nach Rücksprache mit Kollegin Müller festgehalten, dass wir das neue Projekt',
      'Nach Rücksprache mit Kollegin Müller festgehalten, dass wir das neue Projekt bis März abschließen müssen.',
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < phrases.length) {
        setLiveTranscript(phrases[i]);
        i++;
      }
    }, 500);
    
    window.recordingInterval = interval;
  };

  // Text-to-Speech function
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  // Read tasks aloud
  const readTasksAloud = (tasksToRead: any[], intro: string) => {
    if (tasksToRead.length === 0) {
      speakText(intro + ' Keine Aufgaben gefunden.');
      return;
    }
    
    const taskTitles = tasksToRead.map((t: any, i: number) => `${i + 1}. ${t.title}`).join('. ');
    speakText(`${intro} ${tasksToRead.length} Aufgaben: ${taskTitles}`);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (window.recordingInterval) clearInterval(window.recordingInterval);
    
    const transcript = liveTranscript.toLowerCase();
    
    // Check for read/list commands
    const readPatterns = ['lies', 'lese', 'liest', 'vorlesen', 'zeig', 'zeige', 'welche aufgaben'];
    const isReadCommand = readPatterns.some(pattern => transcript.includes(pattern));
    
    if (isReadCommand) {
      let tasksToRead = [];
      let intro = '';
      
      // Check for priority-based reading
      if (transcript.includes('kritisch') || transcript.includes('priorität 1') || transcript.includes('p1')) {
        tasksToRead = todos.filter((t: any) => !t.completed && t.priority === 1);
        intro = 'Kritische Aufgaben:';
      } else if (transcript.includes('hoch') || transcript.includes('priorität 2') || transcript.includes('p2')) {
        tasksToRead = todos.filter((t: any) => !t.completed && t.priority === 2);
        intro = 'Hohe Priorität:';
      } else if (transcript.includes('offen') || transcript.includes('alle aufgaben') || transcript.includes('alles')) {
        tasksToRead = todos.filter((t: any) => !t.completed);
        intro = 'Offene Aufgaben:';
      }
      // Check for person-based reading
      else if (transcript.includes('mit ') || transcript.includes('von ') || transcript.includes('für ')) {
        const allPersonsLower = allPersons.map((p: any) => ({ ...p, nameLower: p.name.toLowerCase() }));
        const matchedPerson = allPersonsLower.find((p: any) => transcript.includes(p.nameLower));
        
        if (matchedPerson) {
          tasksToRead = todos.filter((t: any) => !t.completed && t.persons.includes(matchedPerson.id));
          intro = `Aufgaben mit ${matchedPerson.name}:`;
        }
      }
      // Check for meeting-based reading
      if (tasksToRead.length === 0 && (transcript.includes('meeting') || transcript.includes('termin'))) {
        const allMeetingsLower = allMeetings.map((m: any) => ({ ...m, nameLower: m.name.toLowerCase() }));
        const matchedMeeting = allMeetingsLower.find((m: any) => transcript.includes(m.nameLower));
        
        if (matchedMeeting) {
          tasksToRead = todos.filter((t: any) => !t.completed && t.meetings.includes(matchedMeeting.id));
          intro = `Aufgaben für ${matchedMeeting.name}:`;
        }
      }
      
      // If still no match, try to find any person or meeting name in transcript
      if (tasksToRead.length === 0 && intro === '') {
        // Try persons
        const allPersonsLower = allPersons.map((p: any) => ({ ...p, nameLower: p.name.toLowerCase() }));
        const matchedPerson = allPersonsLower.find((p: any) => transcript.includes(p.nameLower));
        if (matchedPerson) {
          tasksToRead = todos.filter((t: any) => !t.completed && t.persons.includes(matchedPerson.id));
          intro = `Aufgaben mit ${matchedPerson.name}:`;
        }
        
        // Try meetings
        if (tasksToRead.length === 0) {
          const allMeetingsLower = allMeetings.map((m: any) => ({ ...m, nameLower: m.name.toLowerCase() }));
          const matchedMeeting = allMeetingsLower.find((m: any) => transcript.includes(m.nameLower));
          if (matchedMeeting) {
            tasksToRead = todos.filter((t: any) => !t.completed && t.meetings.includes(matchedMeeting.id));
            intro = `Aufgaben für ${matchedMeeting.name}:`;
          }
        }
      }
      
      // Default: read all open tasks
      if (intro === '') {
        tasksToRead = todos.filter((t: any) => !t.completed).slice(0, 10);
        intro = 'Deine offenen Aufgaben:';
      }
      
      // Sort by priority
      tasksToRead = tasksToRead.sort((a: any, b: any) => a.priority - b.priority);
      
      readTasksAloud(tasksToRead, intro);
      setLiveTranscript('');
      return;
    }
    
    // Check if editing existing task
    const editPatterns = ['bearbeite aufgabe', 'ändere aufgabe', 'aktualisiere aufgabe', 'ergänze aufgabe', 'update aufgabe'];
    const isEditCommand = editPatterns.some(pattern => transcript.includes(pattern));
    
    if (isEditCommand) {
      // Extract task name from command
      let taskName = '';
      for (const pattern of editPatterns) {
        if (transcript.includes(pattern)) {
          taskName = transcript.split(pattern)[1]?.trim() || '';
          break;
        }
      }
      
      // Find matching task
      const matchedTask = todos.find((t: any) => 
        t.title.toLowerCase().includes(taskName.split(' ')[0]) || 
        taskName.includes(t.title.toLowerCase().split(' ')[0])
      );
      
      if (matchedTask) {
        setEditingTodo(matchedTask);
        setIsEditMode(true);
        setPendingTodo({
          ...matchedTask,
          description: matchedTask.description + '\n\n[Ergänzung per Sprache]: ' + liveTranscript
        });
        setShowConfirmation(true);
      } else {
        // No match found, create new task instead
        setPendingTodo({
          id: Date.now().toString(),
          title: 'Aufgabe nicht gefunden',
          description: 'Die Aufgabe "' + taskName + '" wurde nicht gefunden. Bitte passe den Titel an oder erstelle eine neue Aufgabe.\n\nOriginal: ' + liveTranscript,
          priority: 3,
          category: 'arbeit',
          actionType: null,
          status: 'offen',
          persons: [],
          meetings: [],
          due_date: null,
          completed: false,
          syncToCalendar: false,
        });
        setIsEditMode(false);
        setEditingTodo(null);
        setShowConfirmation(true);
      }
    } else {
      // Create new task (default behavior)
      setPendingTodo({
        id: Date.now().toString(),
        title: 'Projekt bis März abschließen',
        description: 'Nach Rücksprache mit Kollegin Müller festgehalten, dass wir das neue Projekt bis März abschließen müssen.',
        priority: 2,
        category: 'arbeit',
        actionType: 'gespraech',
        status: 'offen',
        persons: [],
        meetings: [],
        due_date: '2026-03-01',
        completed: false,
        syncToCalendar: false,
      });
      setIsEditMode(false);
      setEditingTodo(null);
      setShowConfirmation(true);
    }
    setLiveTranscript('');
  };

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTodo, setEditingTodo] = useState<any>(null);

  const confirmTodo = () => {
    if (pendingTodo) {
      if (isEditMode && editingTodo) {
        // Update existing task
        setTodos(prev => prev.map((t: any) => t.id === editingTodo.id ? pendingTodo : t));
      } else {
        // Add new task
        setTodos(prev => [pendingTodo, ...prev]);
      }
      setShowConfirmation(false);
      setPendingTodo(null);
      setIsEditMode(false);
      setEditingTodo(null);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1500);
    }
  };

  const handleDeleteTodo = (todo: any) => {
    setDeleteTodoModal({ show: true, todo });
  };

  const confirmDeleteTodo = () => {
    if (deleteTodoModal.todo) {
      setTodos(prev => prev.filter((t: any) => t.id !== deleteTodoModal.todo.id));
      setDeleteTodoModal({ show: false, todo: null });
    }
  };

  const handleToggle = (id: string, e?: any) => {
    const todo = todos.find((t: any) => t.id === id);
    if (!todo.completed) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1500);
    }
    setTodos(prev => prev.map((t: any) => 
      t.id === id ? { ...t, completed: !t.completed, status: t.completed ? 'offen' : 'erledigt' } : t
    ));
  };

  const handleSelectAction = (actionId: string) => {
    setSelectedActions(prev => 
      prev.includes(actionId) 
        ? prev.filter((id: string) => id !== actionId)
        : [...prev, actionId]
    );
  };

  const handleSelectPerson = (personId: string) => {
    setSelectedPersons(prev => 
      prev.includes(personId) 
        ? prev.filter((id: string) => id !== personId)
        : [...prev, personId]
    );
  };

  const handleSelectMeeting = (meetingId: string) => {
    setSelectedMeetings(prev => 
      prev.includes(meetingId) 
        ? prev.filter((id: string) => id !== meetingId)
        : [...prev, meetingId]
    );
  };

  const clearFilters = () => {
    setSelectedActions([]);
    setSelectedPersons([]);
    setSelectedMeetings([]);
    setSelectedPriority(null);
    setSelectedToday(false);
    setSelectedStatus(null);
  };

  const saveNewAction = () => {
    if (newItemName.trim()) {
      const newAction = {
        id: `custom-action-${Date.now()}`,
        label: newItemName.trim(),
        icon: 'check'
      };
      setCustomActions([...customActions, newAction]);
      setNewItemName('');
      setAddingAction(false);
    }
  };

  const saveNewPerson = () => {
    if (newItemName.trim()) {
      const newPerson = {
        id: `custom-person-${Date.now()}`,
        name: newItemName.trim(),
        department: 'Neu'
      };
      setCustomPersons([...customPersons, newPerson]);
      setNewItemName('');
      setAddingPerson(false);
    }
  };

  const saveNewMeeting = () => {
    if (newItemName.trim()) {
      const newMeeting = {
        id: `custom-meeting-${Date.now()}`,
        name: newItemName.trim(),
        rhythm: 'Individuell'
      };
      setCustomMeetings([...customMeetings, newMeeting]);
      setNewItemName('');
      setAddingMeeting(false);
    }
  };

  const deleteCustomAction = (id: string) => {
    if (id.startsWith('custom-')) {
      setCustomActions(customActions.filter((a: any) => a.id !== id));
    } else {
      setDeletedActions([...deletedActions, id]);
    }
    // Remove from any todos that have this action
    setTodos(todos.map((t: any) => t.actionType === id ? { ...t, actionType: null } : t));
    setSelectedActions(prev => prev.filter(a => a !== id));
  };

  const deleteCustomPerson = (id: string) => {
    if (id.startsWith('custom-')) {
      setCustomPersons(customPersons.filter((p: any) => p.id !== id));
    } else {
      setDeletedPersons([...deletedPersons, id]);
    }
    // Remove from any todos that have this person
    setTodos(todos.map((t: any) => ({ ...t, persons: t.persons.filter((p: string) => p !== id) })));
    setSelectedPersons(prev => prev.filter(p => p !== id));
  };

  const deleteCustomMeeting = (id: string) => {
    if (id.startsWith('custom-')) {
      setCustomMeetings(customMeetings.filter((m: any) => m.id !== id));
    } else {
      setDeletedMeetings([...deletedMeetings, id]);
    }
    // Remove from any todos that have this meeting
    setTodos(todos.map((t: any) => ({ ...t, meetings: t.meetings.filter((m: string) => m !== id) })));
    setSelectedMeetings(prev => prev.filter(m => m !== id));
  };

  const confirmDelete = () => {
    // Check if item is assigned to any todo
    let hasAssignments = false;
    if (deleteModal.type === 'action') {
      hasAssignments = todos.some((t: any) => t.actionType === deleteModal.id && !t.completed);
    } else if (deleteModal.type === 'person') {
      hasAssignments = todos.some((t: any) => t.persons.includes(deleteModal.id) && !t.completed);
    } else if (deleteModal.type === 'meeting') {
      hasAssignments = todos.some((t: any) => t.meetings.includes(deleteModal.id) && !t.completed);
    }

    // If step 1 and has assignments, show warning
    if (deleteModal.step === 1 && hasAssignments) {
      setDeleteModal({ ...deleteModal, step: 2, hasAssignments: true });
      return;
    }

    // Actually delete
    if (deleteModal.type === 'action') {
      deleteCustomAction(deleteModal.id);
    } else if (deleteModal.type === 'person') {
      deleteCustomPerson(deleteModal.id);
    } else if (deleteModal.type === 'meeting') {
      deleteCustomMeeting(deleteModal.id);
    }
    setDeleteModal({ show: false, type: null, id: null, name: '', step: 1, hasAssignments: false });
  };

  const hasActiveFilters = selectedActions.length > 0 || selectedPersons.length > 0 || selectedMeetings.length > 0 || selectedPriority !== null || selectedToday || selectedStatus !== null;

  // Get today's date for filtering
  const todayDate = new Date().toISOString().split('T')[0];

  // Filter todos
  const filteredTodos = todos.filter((t: any) => {
    if (!selectedCategories.includes(t.category) && showAllCategories) return false;
    if (!showAllCategories && t.category !== 'arbeit') return false;
    if (selectedActions.length > 0 && !selectedActions.includes(t.actionType)) return false;
    if (selectedPersons.length > 0 && !selectedPersons.some((p: string) => t.persons.includes(p))) return false;
    if (selectedMeetings.length > 0 && !selectedMeetings.some((m: string) => t.meetings.includes(m))) return false;
    if (selectedPriority !== null && t.priority !== selectedPriority) return false;
    if (selectedToday && t.due_date !== todayDate) return false;
    if (selectedStatus === 'completed' && !t.completed) return false;
    if (selectedStatus !== null && selectedStatus !== 'completed' && t.status !== selectedStatus) return false;
    return true;
  });

  const activeTodos = filteredTodos.filter((t: any) => !t.completed).sort((a: any, b: any) => a.priority - b.priority);
  const completedTodos = filteredTodos.filter((t: any) => t.completed);

  // Stats
  const categoryFilteredTodos = todos.filter((t: any) => {
    if (!showAllCategories) return t.category === 'arbeit';
    return selectedCategories.length === 0 || selectedCategories.includes(t.category);
  });
  
  const activeCategoryTodos = categoryFilteredTodos.filter((t: any) => !t.completed);
  
  // Get today's date string for comparison
  const today = new Date().toISOString().split('T')[0];
  
  const stats = {
    today: activeCategoryTodos.filter((t: any) => t.due_date === today).length,
    critical: activeCategoryTodos.filter((t: any) => t.priority === 1).length,
    high: activeCategoryTodos.filter((t: any) => t.priority === 2).length,
    waiting: activeCategoryTodos.filter((t: any) => t.status === 'warten').length,
  };

  return (
    <div className="min-h-screen pb-28 transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      {/* Background Blobs - Mint Dark Theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full" style={{ backgroundColor: '#46F0D2', opacity: darkMode ? 0.12 : 0.20, filter: 'blur(100px)' }} />
        <div className="absolute top-1/3 -left-24 w-[350px] h-[350px] rounded-full" style={{ backgroundColor: '#A78BFA', opacity: darkMode ? 0.10 : 0.18, filter: 'blur(100px)' }} />
        <div className="absolute bottom-48 -right-20 w-[300px] h-[300px] rounded-full" style={{ backgroundColor: '#FF6B8A', opacity: darkMode ? 0.08 : 0.15, filter: 'blur(100px)' }} />
        <div className="absolute bottom-0 left-1/4 w-[350px] h-[350px] rounded-full" style={{ backgroundColor: '#5BC0EB', opacity: darkMode ? 0.08 : 0.15, filter: 'blur(100px)' }} />
      </div>

      {/* Celebration */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl animate-bounce">🎉</div>
        </div>
      )}

      {/* Recording Overlay */}
      {isRecording && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
          <div className="text-center p-8 max-w-md">
            <div className="relative mb-8">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 mx-auto flex items-center justify-center animate-pulse">
                <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </div>
            </div>
            <p className="text-white text-2xl font-mono mb-4">
              {String(Math.floor(recordingTime / 60)).padStart(2, '0')}:{String(recordingTime % 60).padStart(2, '0')}
            </p>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 mb-6 min-h-[80px]">
              <p className="text-white/60 text-sm mb-1">Live-Transkription:</p>
              <p className="text-white text-lg">{liveTranscript || '...'}</p>
            </div>
            <button
              onClick={stopRecording}
              className="px-8 py-4 rounded-full bg-red-500 text-white font-semibold text-lg hover:bg-red-600 transition-colors"
            >
              Aufnahme beenden
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && pendingTodo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div 
            className="w-full max-w-md rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: darkMode ? '#1e1e32' : 'white' }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: theme.text }}>
              {isEditMode ? '✏️ Aufgabe aktualisieren' : 'Habe ich das richtig verstanden?'}
            </h2>
            {isEditMode && (
              <p className="text-sm mb-4 p-2 rounded-xl" style={{ backgroundColor: 'rgba(196,181,253,0.2)', color: '#A78BFA' }}>
                Bearbeite: "{editingTodo?.title}"
              </p>
            )}
            
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block" style={{ color: theme.textMuted }}>Titel</label>
              <input
                type="text"
                value={pendingTodo.title}
                onChange={(e) => setPendingTodo({...pendingTodo, title: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border text-base"
                style={{ 
                  backgroundColor: darkMode ? '#2a2a45' : '#f9fafb', 
                  borderColor: darkMode ? '#3a3a55' : '#e5e7eb',
                  color: theme.text
                }}
              />
            </div>
            
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block" style={{ color: theme.textMuted }}>Beschreibung</label>
              <textarea
                value={pendingTodo.description}
                onChange={(e) => setPendingTodo({...pendingTodo, description: e.target.value})}
                rows={3}
                className="w-full px-4 py-2 rounded-xl border text-sm resize-none"
                style={{ 
                  backgroundColor: darkMode ? '#2a2a45' : '#f9fafb', 
                  borderColor: darkMode ? '#3a3a55' : '#e5e7eb',
                  color: theme.text
                }}
              />
            </div>
            
            {/* AI Suggestions */}
            <div className="mb-4 p-3 rounded-xl" style={{ backgroundColor: darkMode ? '#252540' : '#f0f9ff' }}>
              <p className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: '#3b82f6' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                KI-Vorschläge
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: '#46F0D2', color: '#1f2937' }}>Arbeit</span>
                <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: '#FFAB5E', color: '#1f2937' }}>P2 Hoch</span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">@Sarah</span>
              </div>
            </div>
            
            {/* Priority Selection */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block" style={{ color: theme.textMuted }}>Priorität</label>
              <div className="flex gap-2 flex-wrap">
                {priorities.map((p: any) => (
                  <button
                    key={p.level}
                    onClick={() => setPendingTodo({...pendingTodo, priority: p.level})}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      pendingTodo.priority === p.level ? 'ring-2 ring-offset-1' : 'opacity-60'
                    }`}
                    style={{ backgroundColor: p.color, color: '#1f2937' }}
                  >
                    P{p.level}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Calendar Option */}
            <div 
              className="mb-4 p-3 rounded-xl flex items-center gap-3 cursor-pointer"
              style={{ backgroundColor: darkMode ? '#252540' : '#f0fdf4' }}
              onClick={() => setPendingTodo({...pendingTodo, syncToCalendar: !pendingTodo.syncToCalendar})}
            >
              <div 
                className="w-5 h-5 rounded border-2 flex items-center justify-center"
                style={{ 
                  backgroundColor: pendingTodo.syncToCalendar ? '#22c55e' : 'transparent',
                  borderColor: pendingTodo.syncToCalendar ? '#22c55e' : darkMode ? '#4b5563' : '#d1d5db'
                }}
              >
                {pendingTodo.syncToCalendar && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: theme.text }}>In Kalender eintragen</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>Automatisch Termin anlegen</p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowConfirmation(false); setPendingTodo(null); setIsEditMode(false); setEditingTodo(null); }}
                className="flex-1 px-4 py-3 rounded-xl font-medium"
                style={{ backgroundColor: darkMode ? '#2a2a45' : '#f3f4f6', color: theme.textSecondary }}
              >
                Abbrechen
              </button>
              <button
                onClick={confirmTodo}
                className="flex-1 px-4 py-3 rounded-xl font-medium text-white"
                style={{ background: 'linear-gradient(135deg, #46F0D2, #5BC0EB)' }}
              >
                {isEditMode ? 'Aktualisieren ✓' : 'Speichern ✓'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div 
            className="rounded-2xl p-4 shadow-xl backdrop-blur-xl max-w-xs"
            style={{ backgroundColor: darkMode ? 'rgba(30,30,50,0.95)' : 'rgba(255,255,255,0.95)' }}
          >
            {deleteModal.step === 1 ? (
              <>
                <p className="text-sm mb-3 text-center" style={{ color: theme.text }}>
                  "{deleteModal.name}" löschen?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteModal({ show: false, type: null, id: null, name: '', step: 1, hasAssignments: false })}
                    className="px-4 py-1.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: darkMode ? '#2a2a45' : '#e5e7eb', color: theme.textSecondary }}
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-1.5 rounded-full text-xs font-medium transition-colors"
                    style={{ backgroundColor: 'rgba(255,107,157,0.2)', color: '#FF6B8A' }}
                  >
                    Löschen
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm mb-2 text-center font-medium" style={{ color: '#FF6B8A' }}>
                  ⚠️ Achtung
                </p>
                <p className="text-xs mb-3 text-center" style={{ color: theme.textSecondary }}>
                  "{deleteModal.name}" ist einer aktiven Aufgabe zugeordnet. Trotzdem löschen?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteModal({ show: false, type: null, id: null, name: '', step: 1, hasAssignments: false })}
                    className="px-4 py-1.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: darkMode ? '#2a2a45' : '#e5e7eb', color: theme.textSecondary }}
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-1.5 rounded-full text-xs font-medium transition-colors"
                    style={{ backgroundColor: 'rgba(255,107,157,0.2)', color: '#FF6B8A' }}
                  >
                    Trotzdem löschen
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Todo Modal */}
      {deleteTodoModal.show && deleteTodoModal.todo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div 
            className="rounded-2xl p-4 shadow-xl backdrop-blur-xl max-w-xs"
            style={{ backgroundColor: darkMode ? 'rgba(30,30,50,0.95)' : 'rgba(255,255,255,0.95)' }}
          >
            <p className="text-sm mb-1 text-center font-medium" style={{ color: theme.text }}>
              Aufgabe löschen?
            </p>
            <p className="text-xs mb-3 text-center" style={{ color: theme.textSecondary }}>
              "{deleteTodoModal.todo.title}"
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTodoModal({ show: false, todo: null })}
                className="px-4 py-1.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: darkMode ? '#2a2a45' : '#e5e7eb', color: theme.textSecondary }}
              >
                Abbrechen
              </button>
              <button
                onClick={confirmDeleteTodo}
                className="px-4 py-1.5 rounded-full text-xs font-medium transition-colors"
                style={{ backgroundColor: 'rgba(255,107,157,0.2)', color: '#FF6B8A' }}
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="relative z-10 px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm" style={{ color: theme.textMuted }}>Guten Morgen 👋</p>
            <h1 className="text-2xl font-bold mt-1" style={{ color: theme.text }}>MindFlow</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="w-12 h-12 rounded-2xl backdrop-blur-xl border shadow-lg flex items-center justify-center"
              style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
            >
              {darkMode ? (
                <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" style={{ color: theme.textSecondary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button 
              className="w-12 h-12 rounded-2xl backdrop-blur-xl border shadow-lg flex items-center justify-center"
              style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
            >
              <svg className="w-6 h-6" style={{ color: theme.textSecondary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Category Selection */}
        <div className="flex items-center gap-2 flex-wrap mb-5">
          <button
            onClick={() => {
              if (showAllCategories) {
                if (selectedCategories.includes('arbeit')) {
                  setSelectedCategories(selectedCategories.filter((c: string) => c !== 'arbeit'));
                } else {
                  setSelectedCategories([...selectedCategories, 'arbeit']);
                }
              }
            }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              !showAllCategories || selectedCategories.includes('arbeit')
                ? 'text-gray-800 shadow-md'
                : 'text-gray-400'
            }`}
            style={(!showAllCategories || selectedCategories.includes('arbeit')) ? { backgroundColor: '#46F0D2' } : { backgroundColor: theme.cardBg }}
          >
            Arbeit
          </button>
          
          <button
            onClick={() => {
              if (!showAllCategories) {
                setSelectedCategories([]);
                setShowAllCategories(true);
              } else {
                setSelectedCategories(['arbeit']);
                setShowAllCategories(false);
              }
            }}
            className="px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1"
            style={{ backgroundColor: showAllCategories ? '#e5e7eb' : theme.cardBg, color: theme.textMuted }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Weitere
          </button>
          
          {showAllCategories && categories.filter((c: any) => c.id !== 'arbeit').map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                if (selectedCategories.includes(cat.id)) {
                  setSelectedCategories(selectedCategories.filter((c: string) => c !== cat.id));
                } else {
                  setSelectedCategories([...selectedCategories, cat.id]);
                }
              }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedCategories.includes(cat.id)
                  ? 'text-gray-800 shadow-md'
                  : 'text-gray-400'
              }`}
              style={selectedCategories.includes(cat.id) ? { backgroundColor: cat.color } : { backgroundColor: theme.cardBg }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Stats Cards - Clickable with Liquid Glass */}
        <div className="grid grid-cols-4 gap-2">
          <button 
            onClick={() => setSelectedToday(!selectedToday)}
            className={`relative overflow-hidden rounded-2xl p-3 text-center transition-transform hover:scale-105 active:scale-95 ${selectedToday ? 'ring-2 ring-[#46F0D2]' : ''}`}
            style={{ 
              background: darkMode 
                ? 'linear-gradient(145deg, rgba(25, 28, 40, 0.8), rgba(25, 28, 40, 0.6))'
                : theme.cardBg,
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: `1px solid ${darkMode ? 'rgba(70, 240, 210, 0.15)' : theme.cardBorder}`,
              boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.1)',
            }}
          >
            {darkMode && <div style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: '50%', background: '#46F0D2', boxShadow: '0 0 10px #46F0D2' }} />}
            <p className="text-xl font-bold" style={{ color: '#46F0D2' }}>{stats.today}</p>
            <p className="text-xs mt-1 truncate" style={{ color: theme.textMuted }}>Heute</p>
          </button>
          <button 
            onClick={() => setSelectedPriority(selectedPriority === 1 ? null : 1)}
            className={`relative overflow-hidden rounded-2xl p-3 text-center transition-transform hover:scale-105 active:scale-95 ${selectedPriority === 1 ? 'ring-2 ring-[#FF6B8A]' : ''}`}
            style={{ 
              background: darkMode 
                ? 'linear-gradient(145deg, rgba(25, 28, 40, 0.8), rgba(25, 28, 40, 0.6))'
                : theme.cardBg,
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: `1px solid ${darkMode ? 'rgba(255, 107, 138, 0.15)' : theme.cardBorder}`,
              boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.1)',
            }}
          >
            {darkMode && <div style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: '50%', background: '#FF6B8A', boxShadow: '0 0 10px #FF6B8A' }} />}
            <p className="text-xl font-bold" style={{ color: '#FF6B8A' }}>{stats.critical}</p>
            <p className="text-xs mt-1 truncate" style={{ color: theme.textMuted }}>Kritisch</p>
          </button>
          <button 
            onClick={() => setSelectedPriority(selectedPriority === 2 ? null : 2)}
            className={`relative overflow-hidden rounded-2xl p-3 text-center transition-transform hover:scale-105 active:scale-95 ${selectedPriority === 2 ? 'ring-2 ring-[#FFAB5E]' : ''}`}
            style={{ 
              background: darkMode 
                ? 'linear-gradient(145deg, rgba(25, 28, 40, 0.8), rgba(25, 28, 40, 0.6))'
                : theme.cardBg,
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: `1px solid ${darkMode ? 'rgba(255, 171, 94, 0.15)' : theme.cardBorder}`,
              boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.1)',
            }}
          >
            {darkMode && <div style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: '50%', background: '#FFAB5E', boxShadow: '0 0 10px #FFAB5E' }} />}
            <p className="text-xl font-bold" style={{ color: '#FFAB5E' }}>{stats.high}</p>
            <p className="text-xs mt-1 truncate" style={{ color: theme.textMuted }}>Hoch</p>
          </button>
          <button 
            className="relative overflow-hidden rounded-2xl p-3 text-center transition-transform hover:scale-105 active:scale-95"
            style={{ 
              background: darkMode 
                ? 'linear-gradient(145deg, rgba(25, 28, 40, 0.8), rgba(25, 28, 40, 0.6))'
                : theme.cardBg,
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: `1px solid ${darkMode ? 'rgba(167, 139, 250, 0.15)' : theme.cardBorder}`,
              boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.1)',
            }}
          >
            {darkMode && <div style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: '50%', background: '#A78BFA', boxShadow: '0 0 10px #A78BFA' }} />}
            <p className="text-xl font-bold" style={{ color: '#A78BFA' }}>{stats.waiting}</p>
            <p className="text-xs mt-1 truncate" style={{ color: theme.textMuted }}>Warten</p>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 px-5">
        {activeTab === 'tasks' && (
          <>
            {/* Filter Section */}
            <div className="mb-4">
              {/* Tab Buttons */}
              <div className="grid grid-cols-3 gap-2 mb-2">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'action' ? null : 'action')}
                  className={`px-3 py-2.5 rounded-2xl text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                    expandedSection === 'action'
                      ? 'bg-amber-100 text-amber-800 border-2 border-amber-300'
                      : 'border'
                  }`}
                  style={expandedSection !== 'action' ? { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.textSecondary } : {}}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                  <span className="truncate">Aktion</span>
                  <svg className={`w-3 h-3 flex-shrink-0 transition-transform ${expandedSection === 'action' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setExpandedSection(expandedSection === 'persons' ? null : 'persons')}
                  className={`px-3 py-2.5 rounded-2xl text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                    expandedSection === 'persons'
                      ? 'bg-purple-100 text-purple-800 border-2 border-purple-300'
                      : 'border'
                  }`}
                  style={expandedSection !== 'persons' ? { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.textSecondary } : {}}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                  <span className="truncate">Personen</span>
                  <svg className={`w-3 h-3 flex-shrink-0 transition-transform ${expandedSection === 'persons' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setExpandedSection(expandedSection === 'meetings' ? null : 'meetings')}
                  className={`px-3 py-2.5 rounded-2xl text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                    expandedSection === 'meetings'
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                      : 'border'
                  }`}
                  style={expandedSection !== 'meetings' ? { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.textSecondary } : {}}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  <span className="truncate">Meetings</span>
                  <svg className={`w-3 h-3 flex-shrink-0 transition-transform ${expandedSection === 'meetings' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Expandable Content */}
              {expandedSection === 'action' && (
                <div className="p-3 backdrop-blur-xl bg-amber-50/80 rounded-2xl border border-amber-200">
                  <div className="flex flex-wrap gap-2">
                    {allActions.map((action: any) => {
                      return (
                        <button
                          key={action.id}
                          onClick={() => {
                            if (longPressTriggered.current) {
                              longPressTriggered.current = false;
                              return;
                            }
                            handleSelectAction(action.id);
                          }}
                          onMouseDown={() => {
                            longPressTriggered.current = false;
                            pressTimerRef.current = setTimeout(() => {
                              longPressTriggered.current = true;
                              setDeleteModal({ show: true, type: 'action', id: action.id, name: action.label, step: 1, hasAssignments: false });
                            }, 600);
                          }}
                          onMouseUp={() => {
                            clearTimeout(pressTimerRef.current);
                          }}
                          onMouseLeave={() => {
                            clearTimeout(pressTimerRef.current);
                          }}
                          onTouchStart={() => {
                            longPressTriggered.current = false;
                            pressTimerRef.current = setTimeout(() => {
                              longPressTriggered.current = true;
                              setDeleteModal({ show: true, type: 'action', id: action.id, name: action.label, step: 1, hasAssignments: false });
                            }, 600);
                          }}
                          onTouchEnd={() => {
                            clearTimeout(pressTimerRef.current);
                          }}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors shadow-sm flex items-center gap-1.5 select-none ${
                            selectedActions.includes(action.id)
                              ? 'bg-amber-200 text-amber-900 ring-2 ring-amber-400'
                              : 'bg-white text-amber-700 hover:bg-amber-100'
                          }`}
                        >
                          <ActionIcon type={action.icon} className="w-4 h-4" />
                          {action.label}
                        </button>
                      );
                    })}
                    
                    {/* Add new action */}
                    {addingAction ? (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveNewAction()}
                          placeholder="Name..."
                          autoFocus
                          className="px-3 py-1.5 rounded-full text-sm border-2 border-amber-300 bg-white text-amber-900 w-32 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); saveNewAction(); }}
                          className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setAddingAction(false); setNewItemName(''); }}
                          className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-300 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setAddingAction(true); }}
                        className="w-8 h-8 rounded-full text-sm font-medium bg-amber-100/50 text-amber-600 hover:bg-amber-200/50 transition-colors flex items-center justify-center border-2 border-dashed border-amber-300"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {expandedSection === 'persons' && (
                <div className="p-3 backdrop-blur-xl bg-purple-50/80 rounded-2xl border border-purple-200">
                  <div className="flex flex-wrap gap-2">
                    {allPersons.map(person => {
                      return (
                        <button
                          key={person.id}
                          onClick={() => {
                            if (longPressTriggered.current) {
                              longPressTriggered.current = false;
                              return;
                            }
                            handleSelectPerson(person.id);
                          }}
                          onMouseDown={() => {
                            longPressTriggered.current = false;
                            pressTimerRef.current = setTimeout(() => {
                              longPressTriggered.current = true;
                              setDeleteModal({ show: true, type: 'person', id: person.id, name: `@${person.name}`, step: 1, hasAssignments: false });
                            }, 600);
                          }}
                          onMouseUp={() => {
                            clearTimeout(pressTimerRef.current);
                          }}
                          onMouseLeave={() => {
                            clearTimeout(pressTimerRef.current);
                          }}
                          onTouchStart={() => {
                            longPressTriggered.current = false;
                            pressTimerRef.current = setTimeout(() => {
                              longPressTriggered.current = true;
                              setDeleteModal({ show: true, type: 'person', id: person.id, name: `@${person.name}`, step: 1, hasAssignments: false });
                            }, 600);
                          }}
                          onTouchEnd={() => {
                            clearTimeout(pressTimerRef.current);
                          }}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors shadow-sm select-none ${
                            selectedPersons.includes(person.id)
                              ? 'bg-purple-200 text-purple-900 ring-2 ring-purple-400'
                              : 'bg-white text-purple-700 hover:bg-purple-100'
                          }`}
                        >
                          @{person.name}
                        </button>
                      );
                    })}
                    
                    {/* Add new person */}
                    {addingPerson ? (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveNewPerson()}
                          placeholder="Name..."
                          autoFocus
                          className="px-3 py-1.5 rounded-full text-sm border-2 border-purple-300 bg-white text-purple-900 w-32 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); saveNewPerson(); }}
                          className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center hover:bg-purple-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setAddingPerson(false); setNewItemName(''); }}
                          className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-300 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setAddingPerson(true); }}
                        className="w-8 h-8 rounded-full text-sm font-medium bg-purple-100/50 text-purple-600 hover:bg-purple-200/50 transition-colors flex items-center justify-center border-2 border-dashed border-purple-300"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {expandedSection === 'meetings' && (
                <div className="p-3 backdrop-blur-xl bg-blue-50/80 rounded-2xl border border-blue-200">
                  <div className="flex flex-wrap gap-2">
                    {allMeetings.map(meeting => {
                      return (
                        <button
                          key={meeting.id}
                          onClick={() => {
                            if (longPressTriggered.current) {
                              longPressTriggered.current = false;
                              return;
                            }
                            handleSelectMeeting(meeting.id);
                          }}
                          onMouseDown={() => {
                            longPressTriggered.current = false;
                            pressTimerRef.current = setTimeout(() => {
                              longPressTriggered.current = true;
                              setDeleteModal({ show: true, type: 'meeting', id: meeting.id, name: `#${meeting.name}`, step: 1, hasAssignments: false });
                            }, 600);
                          }}
                          onMouseUp={() => {
                            clearTimeout(pressTimerRef.current);
                          }}
                          onMouseLeave={() => {
                            clearTimeout(pressTimerRef.current);
                          }}
                          onTouchStart={() => {
                            longPressTriggered.current = false;
                            pressTimerRef.current = setTimeout(() => {
                              longPressTriggered.current = true;
                              setDeleteModal({ show: true, type: 'meeting', id: meeting.id, name: `#${meeting.name}`, step: 1, hasAssignments: false });
                            }, 600);
                          }}
                          onTouchEnd={() => {
                            clearTimeout(pressTimerRef.current);
                          }}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors shadow-sm select-none ${
                            selectedMeetings.includes(meeting.id)
                              ? 'bg-blue-200 text-blue-900 ring-2 ring-blue-400'
                              : 'bg-white text-blue-700 hover:bg-blue-100'
                          }`}
                        >
                          #{meeting.name}
                        </button>
                      );
                    })}
                    
                    {/* Add new meeting */}
                    {addingMeeting ? (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveNewMeeting()}
                          placeholder="Name..."
                          autoFocus
                          className="px-3 py-1.5 rounded-full text-sm border-2 border-blue-300 bg-white text-blue-900 w-32 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); saveNewMeeting(); }}
                          className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setAddingMeeting(false); setNewItemName(''); }}
                          className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-300 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setAddingMeeting(true); }}
                        className="w-8 h-8 rounded-full text-sm font-medium bg-blue-100/50 text-blue-600 hover:bg-blue-200/50 transition-colors flex items-center justify-center border-2 border-dashed border-blue-300"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 mb-4 p-3 backdrop-blur-xl rounded-2xl border flex-wrap" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                <span className="text-xs" style={{ color: theme.textMuted }}>Filter:</span>
                
                {selectedToday && (
                  <button 
                    onClick={() => setSelectedToday(false)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: 'rgba(129,140,248,0.2)', color: '#818CF8' }}
                  >
                    Heute
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                
                {selectedPriority !== null && (
                  <button 
                    onClick={() => setSelectedPriority(null)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: selectedPriority === 1 ? 'rgba(255,107,157,0.2)' : 'rgba(253,186,116,0.3)',
                      color: selectedPriority === 1 ? '#FF6B8A' : '#F97316'
                    }}
                  >
                    {selectedPriority === 1 ? 'Kritisch' : 'Hoch'}
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                
                {selectedActions.map((actionId: string) => {
                  const action = allActions.find((a: any) => a.id === actionId);
                  return (
                    <button 
                      key={actionId}
                      onClick={() => setSelectedActions(prev => prev.filter((id: string) => id !== actionId))}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 hover:bg-amber-200"
                    >
                      <ActionIcon type={action?.icon} className="w-3.5 h-3.5" />
                      {action?.label}
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  );
                })}
                
                {selectedPersons.map((personId: string) => {
                  const person = allPersons.find((p: any) => p.id === personId);
                  return (
                    <button 
                      key={personId}
                      onClick={() => setSelectedPersons(prev => prev.filter((id: string) => id !== personId))}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 hover:bg-purple-200"
                    >
                      @{person?.name}
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  );
                })}
                
                {selectedMeetings.map((meetingId: string) => {
                  const meeting = allMeetings.find((m: any) => m.id === meetingId);
                  return (
                    <button 
                      key={meetingId}
                      onClick={() => setSelectedMeetings(prev => prev.filter((id: string) => id !== meetingId))}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                    >
                      #{meeting?.name}
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  );
                })}
                
                {selectedStatus !== null && (
                  <button 
                    onClick={() => setSelectedStatus(null)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: selectedStatus === 'completed' ? 'rgba(156,163,175,0.2)' : `${statusOptions.find((s: any) => s.id === selectedStatus)?.color}30`,
                      color: selectedStatus === 'completed' ? '#6B7280' : statusOptions.find((s: any) => s.id === selectedStatus)?.color
                    }}
                  >
                    {selectedStatus === 'completed' ? 'Erledigt' : statusOptions.find((s: any) => s.id === selectedStatus)?.label}
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                
                <button 
                  onClick={clearFilters}
                  className="ml-auto text-xs hover:underline"
                  style={{ color: theme.textMuted }}
                >
                  Alle löschen
                </button>
              </div>
            )}

            {/* Todo List */}
            <div className="space-y-3">
              {activeTodos.length === 0 && completedTodos.length === 0 ? (
                <div className="text-center py-12">
                  <p style={{ color: theme.textMuted }}>Keine Aufgaben gefunden</p>
                </div>
              ) : (
                <>
                  {activeTodos.map((todo: any) => (
                    <TodoCard 
                      key={todo.id} 
                      todo={todo} 
                      onToggle={handleToggle}
                      onSelectPerson={handleSelectPerson}
                      onSelectMeeting={handleSelectMeeting}
                      onDelete={handleDeleteTodo}
                      darkMode={darkMode}
                      theme={theme}
                    />
                  ))}
                  
                  {completedTodos.length > 0 && selectedStatus !== 'completed' && (
                    <>
                      <div className="flex items-center gap-3 pt-4">
                        <div className="flex-1 h-px" style={{ backgroundColor: theme.cardBorder }} />
                        <span className="text-xs" style={{ color: theme.textMuted }}>Erledigt ({completedTodos.length})</span>
                        <div className="flex-1 h-px" style={{ backgroundColor: theme.cardBorder }} />
                      </div>
                      {completedTodos.map((todo: any) => (
                        <TodoCard 
                          key={todo.id} 
                          todo={todo} 
                          onToggle={handleToggle}
                          onSelectPerson={handleSelectPerson}
                          onSelectMeeting={handleSelectMeeting}
                          onDelete={handleDeleteTodo}
                          darkMode={darkMode}
                          theme={theme}
                        />
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {activeTab === 'filter' && (
          <div className="space-y-6">
            <h2 className="font-semibold" style={{ color: theme.text }}>Ansichten</h2>
            
            {/* By Priority */}
            <div className="backdrop-blur-xl rounded-2xl p-4 border" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <p className="text-xs uppercase tracking-wider mb-3" style={{ color: theme.textMuted }}>Nach Priorität</p>
              <div className="space-y-2">
                {priorities.map((p: any) => {
                  const count = todos.filter((t: any) => t.priority === p.level && !t.completed).length;
                  const isSelected = selectedPriority === p.level;
                  return (
                    <div 
                      key={p.level} 
                      onClick={() => {
                        setSelectedPriority(isSelected ? null : p.level);
                        setActiveTab('tasks');
                      }}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${isSelected ? 'ring-2' : 'hover:bg-white/20'}`}
                      style={{ 
                        backgroundColor: isSelected ? `${p.color}20` : 'transparent',
                        ringColor: p.color
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                        <span style={{ color: theme.text }}>P{p.level} - {p.label}</span>
                      </div>
                      <span style={{ color: theme.textMuted }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* By Status */}
            <div className="backdrop-blur-xl rounded-2xl p-4 border" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <p className="text-xs uppercase tracking-wider mb-3" style={{ color: theme.textMuted }}>Nach Status</p>
              <div className="space-y-2">
                {statusOptions.filter((s: any) => s.id !== 'erledigt').map(s => {
                  const count = todos.filter((t: any) => t.status === s.id && !t.completed).length;
                  const isSelected = selectedStatus === s.id;
                  return (
                    <div 
                      key={s.id} 
                      onClick={() => {
                        setSelectedStatus(isSelected ? null : s.id);
                        setActiveTab('tasks');
                      }}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${isSelected ? 'ring-2' : 'hover:bg-white/20'}`}
                      style={{ 
                        backgroundColor: isSelected ? `${s.color}20` : 'transparent',
                        ringColor: s.color
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                        <span style={{ color: theme.text }}>{s.label}</span>
                      </div>
                      <span style={{ color: theme.textMuted }}>{count}</span>
                    </div>
                  );
                })}
                
                {/* Erledigt Option - ohne Punkt */}
                {(() => {
                  const completedCount = todos.filter((t: any) => t.completed).length;
                  const isSelected = selectedStatus === 'completed';
                  return (
                    <div 
                      onClick={() => {
                        setSelectedStatus(isSelected ? null : 'completed');
                        setActiveTab('tasks');
                      }}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${isSelected ? 'ring-2 ring-gray-400' : 'hover:bg-white/20'}`}
                      style={{ 
                        backgroundColor: isSelected ? 'rgba(156,163,175,0.2)' : 'transparent'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4" style={{ color: theme.textMuted }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span style={{ color: theme.textMuted }}>Erledigt</span>
                      </div>
                      <span style={{ color: theme.textMuted }}>{completedCount}</span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* By Action Type */}
            <div className="backdrop-blur-xl rounded-2xl p-4 border" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <p className="text-xs uppercase tracking-wider mb-3" style={{ color: theme.textMuted }}>Nach Aktionstyp</p>
              <div className="space-y-2">
                {actionTypes.map((a: any) => {
                  const count = todos.filter((t: any) => t.actionType === a.id && !t.completed).length;
                  const isSelected = selectedActions.includes(a.id);
                  return (
                    <div 
                      key={a.id} 
                      onClick={() => {
                        if (isSelected) {
                          setSelectedActions(prev => prev.filter((id: string) => id !== a.id));
                        } else {
                          setSelectedActions(prev => [...prev, a.id]);
                        }
                        setActiveTab('tasks');
                      }}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${isSelected ? 'ring-2 ring-amber-400 bg-amber-50' : 'hover:bg-white/20'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span style={{ color: theme.textSecondary }}><ActionIcon type={a.icon} className="w-5 h-5" /></span>
                        <span style={{ color: theme.text }}>{a.label}</span>
                      </div>
                      <span style={{ color: theme.textMuted }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* By Person */}
            <div className="backdrop-blur-xl rounded-2xl p-4 border" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <p className="text-xs uppercase tracking-wider mb-3" style={{ color: theme.textMuted }}>Nach Person</p>
              <div className="space-y-2">
                {personTags.map((p: any) => {
                  const count = todos.filter((t: any) => t.persons.includes(p.id) && !t.completed).length;
                  const isSelected = selectedPersons.includes(p.id);
                  return (
                    <div 
                      key={p.id} 
                      onClick={() => {
                        if (isSelected) {
                          setSelectedPersons(prev => prev.filter((id: string) => id !== p.id));
                        } else {
                          setSelectedPersons(prev => [...prev, p.id]);
                        }
                        setActiveTab('tasks');
                      }}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${isSelected ? 'ring-2 ring-purple-400 bg-purple-50' : 'hover:bg-white/20'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-sm font-medium">
                          {p.name.charAt(0)}
                        </span>
                        <div>
                          <span style={{ color: theme.text }}>@{p.name}</span>
                          <p className="text-xs" style={{ color: theme.textMuted }}>{p.department}</p>
                        </div>
                      </div>
                      <span style={{ color: theme.textMuted }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* By Meeting */}
            <div className="backdrop-blur-xl rounded-2xl p-4 border" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <p className="text-xs uppercase tracking-wider mb-3" style={{ color: theme.textMuted }}>Nach Meeting</p>
              <div className="space-y-2">
                {meetingTags.map((m: any) => {
                  const count = todos.filter((t: any) => t.meetings.includes(m.id) && !t.completed).length;
                  const isSelected = selectedMeetings.includes(m.id);
                  return (
                    <div 
                      key={m.id} 
                      onClick={() => {
                        if (isSelected) {
                          setSelectedMeetings(prev => prev.filter((id: string) => id !== m.id));
                        } else {
                          setSelectedMeetings(prev => [...prev, m.id]);
                        }
                        setActiveTab('tasks');
                      }}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${isSelected ? 'ring-2 ring-blue-400 bg-blue-50' : 'hover:bg-white/20'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                          </svg>
                        </span>
                        <div>
                          <span style={{ color: theme.text }}>#{m.name}</span>
                          <p className="text-xs" style={{ color: theme.textMuted }}>{m.rhythm}</p>
                        </div>
                      </div>
                      <span style={{ color: theme.textMuted }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 px-5 pb-6 pt-2">
        <div 
          className="backdrop-blur-xl rounded-3xl border shadow-xl p-2"
          style={{ backgroundColor: darkMode ? 'rgba(30,30,50,0.85)' : 'rgba(255,255,255,0.7)', borderColor: theme.cardBorder }}
        >
          <div className="flex items-center justify-around">
            {/* Tasks */}
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex flex-col items-center py-2 px-4 rounded-2xl transition-all ${
                activeTab === 'tasks' 
                  ? darkMode ? 'bg-white/10 text-[#46F0D2]' : 'bg-white/60 text-[#46F0D2]' 
                  : ''
              }`}
              style={activeTab !== 'tasks' ? { color: theme.textMuted } : {}}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span className="text-xs mt-1">Aufgaben</span>
            </button>
            
            {/* Voice */}
            <button
              onClick={startRecording}
              className="flex flex-col items-center text-white shadow-lg -mt-4 px-5 py-3 rounded-2xl transition-transform hover:scale-110 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #46F0D2 0%, #5BC0EB 100%)' }}
            >
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
            
            {/* Filter */}
            <button
              onClick={() => setActiveTab('filter')}
              className={`flex flex-col items-center py-2 px-4 rounded-2xl transition-all ${
                activeTab === 'filter' 
                  ? darkMode ? 'bg-white/10 text-[#46F0D2]' : 'bg-white/60 text-[#46F0D2]' 
                  : ''
              }`}
              style={activeTab !== 'filter' ? { color: theme.textMuted } : {}}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="text-xs mt-1">Filter</span>
            </button>
          </div>
        </div>
      </nav>

      {/* CSS Animations */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(-25%); }
          50% { transform: translateY(0); }
        }
        .animate-bounce { animation: bounce 1s infinite; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse { animation: pulse 2s infinite; }
      `}</style>
    </div>
  );
}
