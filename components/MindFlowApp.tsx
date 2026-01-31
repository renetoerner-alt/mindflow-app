import React from 'react';

// MindFlow - Mint Dark Theme with Liquid Glass Cards
export default function MindFlowLiquidGlassPreview() {
  
  // Color palette (unchanged)
  const colors = {
    mint: '#46F0D2',
    bgDark: '#131321',
    peach: '#FBE2B4',
    white: '#FFFFFF',
    coral: '#FF6B8A',
    purple: '#A78BFA',
    orange: '#FFAB5E',
    skyBlue: '#5BC0EB',
    textMuted: '#6B7280',
  };

  const stats = {
    today: 1,
    critical: 1,
    high: 3,
    waiting: 1,
  };

  const todos = [
    {
      id: 1,
      title: 'Angebot an Kunde Müller senden',
      category: 'Arbeit',
      action: 'E-Mail',
      priority: 1,
      priorityColor: colors.coral,
      status: 'Offen',
      dueDate: '30. Jan.',
      persons: ['Lisa'],
    },
    {
      id: 2,
      title: 'Budget-Freigabe für Q2 Kampagne einholen',
      category: 'Arbeit',
      action: 'Gespräch',
      priority: 2,
      priorityColor: colors.orange,
      status: 'Offen',
      dueDate: '15. Feb.',
      persons: ['Sarah', 'Thomas'],
      meetings: ['Team Weekly'],
    },
    {
      id: 3,
      title: 'Quartalsbericht prüfen und freigeben',
      category: 'Finanzen',
      action: 'Prüfen',
      priority: 3,
      priorityColor: colors.mint,
      status: 'In Arbeit',
      dueDate: '20. Feb.',
      persons: ['Thomas'],
    },
  ];

  // Base glass card style
  const glassCard = {
    background: 'rgba(30, 32, 48, 0.6)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
  };

  // Task card with colored glow and accent line
  const TaskCard = ({ todo }) => (
    <div style={{
      position: 'relative',
      borderRadius: '16px',
      overflow: 'hidden',
    }}>
      {/* Background glow effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `radial-gradient(ellipse at left center, ${todo.priorityColor}15 0%, transparent 60%)`,
        pointerEvents: 'none',
      }} />
      
      {/* Card content */}
      <div style={{
        position: 'relative',
        background: 'rgba(25, 28, 40, 0.7)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid ${todo.priorityColor}20`,
        borderRadius: '16px',
        padding: '16px',
        paddingLeft: '20px',
      }}>
        {/* Left accent line - short, not full height */}
        <div style={{
          position: 'absolute',
          left: '0',
          top: '16px',
          bottom: '16px',
          width: '3px',
          background: `linear-gradient(180deg, ${todo.priorityColor} 0%, ${todo.priorityColor}60 100%)`,
          borderRadius: '0 2px 2px 0',
          boxShadow: `0 0 12px ${todo.priorityColor}80, 0 0 24px ${todo.priorityColor}40`,
        }} />
        
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <div style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            border: `2px solid ${todo.priorityColor}60`,
            marginTop: '2px',
            flexShrink: 0,
            background: 'rgba(255,255,255,0.03)',
          }} />
          
          <div className="flex-1">
            {/* Tags Row */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span style={{
                background: `${colors.mint}15`,
                borderRadius: '6px',
                padding: '2px 8px',
                color: colors.mint,
                fontSize: '11px',
                fontWeight: '600',
                border: `1px solid ${colors.mint}20`,
              }}>
                {todo.category}
              </span>
              <span style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '6px',
                padding: '2px 8px',
                color: colors.textMuted,
                fontSize: '11px',
              }}>
                ✉️ {todo.action}
              </span>
              
              <div className="flex-1" />
              
              {/* Priority indicator */}
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: todo.priorityColor,
                boxShadow: `0 0 8px ${todo.priorityColor}`,
              }} />
              
              <span style={{ color: colors.mint, fontSize: '14px' }}>🔊</span>
              <span style={{ color: colors.textMuted, fontSize: '12px' }}>▼</span>
            </div>
            
            {/* Title */}
            <h3 style={{ 
              color: colors.white, 
              fontSize: '14px', 
              fontWeight: '600',
              marginBottom: '10px',
              lineHeight: '1.4',
            }}>
              {todo.title}
            </h3>
            
            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-2">
              <span style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '4px',
                padding: '2px 8px',
                color: colors.textMuted,
                fontSize: '11px',
              }}>
                {todo.status}
              </span>
              <span style={{ color: colors.textMuted, fontSize: '11px' }}>
                📅 {todo.dueDate}
              </span>
              {todo.persons?.map((person, i) => (
                <span key={i} style={{
                  color: colors.purple,
                  fontSize: '11px',
                  fontWeight: '500',
                }}>
                  @{person}
                </span>
              ))}
              {todo.meetings?.map((meeting, i) => (
                <span key={i} style={{
                  color: colors.skyBlue,
                  fontSize: '11px',
                  fontWeight: '500',
                }}>
                  #{meeting}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ 
      background: colors.bgDark,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: colors.white,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow effects */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '250px',
        height: '250px',
        background: `radial-gradient(circle, ${colors.mint}15 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '300px',
        left: '-100px',
        width: '300px',
        height: '300px',
        background: `radial-gradient(circle, ${colors.purple}10 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <header style={{ padding: '20px 20px 16px', position: 'relative', zIndex: 10 }}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <p style={{ color: colors.textMuted, fontSize: '14px', marginBottom: '4px' }}>
              Guten Abend 👋
            </p>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '700',
              color: colors.white,
            }}>
              MindFlow
            </h1>
          </div>
          <div className="flex gap-3">
            <button style={{
              ...glassCard,
              borderRadius: '14px',
              padding: '10px',
              color: colors.white,
            }}>
              🌙
            </button>
            <button style={{
              ...glassCard,
              borderRadius: '14px',
              padding: '10px',
              color: colors.white,
            }}>
              🔍
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 mb-5">
          <span style={{
            background: colors.mint,
            borderRadius: '20px',
            padding: '8px 18px',
            color: colors.bgDark,
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: `0 4px 15px ${colors.mint}40`,
          }}>
            Arbeit
          </span>
          <span style={{
            ...glassCard,
            borderRadius: '20px',
            padding: '8px 18px',
            color: colors.textMuted,
            fontSize: '14px',
            fontWeight: '500',
          }}>
            + Weitere
          </span>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Heute', value: stats.today, color: colors.mint },
            { label: 'Kritisch', value: stats.critical, color: colors.coral },
            { label: 'Hoch', value: stats.high, color: colors.orange },
            { label: 'Warten', value: stats.waiting, color: colors.purple },
          ].map((stat, i) => (
            <button key={i} style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '16px',
            }}>
              {/* Glow background */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `radial-gradient(ellipse at center, ${stat.color}10 0%, transparent 70%)`,
              }} />
              <div style={{
                position: 'relative',
                background: 'rgba(25, 28, 40, 0.7)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${stat.color}15`,
                borderRadius: '16px',
                padding: '14px 8px',
                textAlign: 'center',
              }}>
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: stat.color,
                  boxShadow: `0 0 8px ${stat.color}`,
                }} />
                <div style={{ color: stat.color, fontSize: '24px', fontWeight: '700' }}>
                  {stat.value}
                </div>
                <div style={{ color: colors.textMuted, fontSize: '10px', marginTop: '4px', fontWeight: '500' }}>
                  {stat.label}
                </div>
              </div>
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main style={{ padding: '0 16px', position: 'relative', zIndex: 10 }}>
        {/* Filter Dropdowns */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Aktion', icon: '⚡', color: colors.peach },
            { label: 'Personen', icon: '👥', color: colors.purple },
            { label: 'Meetings', icon: '📅', color: colors.skyBlue },
          ].map((filter, i) => (
            <button key={i} style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '12px',
            }}>
              <div style={{
                position: 'relative',
                background: 'rgba(25, 28, 40, 0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                padding: '12px',
                color: colors.white,
                fontSize: '13px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}>
                <span style={{ color: filter.color }}>{filter.icon}</span>
                {filter.label}
                <span style={{ color: colors.textMuted, fontSize: '10px' }}>▼</span>
              </div>
            </button>
          ))}
        </div>

        {/* Task Cards with liquid glass effect */}
        <div className="space-y-3 mb-24">
          {todos.map((todo) => (
            <TaskCard key={todo.id} todo={todo} />
          ))}
        </div>
      </main>

      {/* Bottom Navigation */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '16px',
        right: '16px',
        background: 'rgba(25, 28, 40, 0.8)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '24px',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 20,
      }}>
        <button style={{ 
          color: colors.mint, 
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '22px' }}>📋</div>
          <div style={{ fontSize: '10px', marginTop: '2px', fontWeight: '600' }}>Aufgaben</div>
        </button>
        
        <button style={{
          background: `linear-gradient(135deg, ${colors.mint}, ${colors.skyBlue})`,
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          boxShadow: `0 4px 20px ${colors.mint}50, 0 0 40px ${colors.mint}30`,
          marginTop: '-28px',
          border: '4px solid rgba(255,255,255,0.1)',
          color: colors.bgDark,
        }}>
          🎤
        </button>
        
        <button style={{ color: colors.textMuted, textAlign: 'center' }}>
          <div style={{ fontSize: '22px' }}>⚙️</div>
          <div style={{ fontSize: '10px', marginTop: '2px' }}>Filter</div>
        </button>
      </div>
    </div>
  );
}
