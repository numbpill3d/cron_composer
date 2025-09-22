import React, { useState, useEffect } from 'react';

interface CronState {
  minute: string;
  hour: string;
  day: string;
  month: string;
  weekday: string;
}

interface ActionConfig {
  type: string;
  // Shell script
  scriptPath?: string;
  // HTTP Request
  url?: string;
  method?: string;
  headers?: string;
  body?: string;
  // Python/Node script
  scriptContent?: string;
  scriptFile?: string;
  // Webhook
  webhookUrl?: string;
  payload?: string;
  // Docker
  image?: string;
  containerArgs?: string;
  // Custom command
  command?: string;
}

interface Preset {
  name: string;
  description: string;
  cron: CronState;
  action: ActionConfig;
}

export function CronBuilder() {
  const [cronState, setCronState] = useState<CronState>({
    minute: '*',
    hour: '*',
    day: '*',
    month: '*',
    weekday: '*'
  });

  const [cronString, setCronString] = useState('* * * * *');
  const [englishTranslation, setEnglishTranslation] = useState('Every minute');
  
  const [selectedAction, setSelectedAction] = useState<string>('shell');
  const [actionConfig, setActionConfig] = useState<ActionConfig>({
    type: 'shell',
    scriptPath: '/path/to/script.sh'
  });

  const [fullCommand, setFullCommand] = useState('* * * * * /path/to/script.sh');
  const [fullTranslation, setFullTranslation] = useState('Run shell script every minute');

  // Options for dropdowns
  const minuteOptions = [
    { value: '*', label: 'Every minute' },
    { value: '0', label: '0 (top of hour)' },
    { value: '15', label: '15' },
    { value: '30', label: '30' },
    { value: '45', label: '45' },
    { value: '*/5', label: 'Every 5 minutes' },
    { value: '*/10', label: 'Every 10 minutes' },
    { value: '*/15', label: 'Every 15 minutes' },
    { value: '*/30', label: 'Every 30 minutes' }
  ];

  const hourOptions = [
    { value: '*', label: 'Every hour' },
    ...Array.from({ length: 24 }, (_, i) => ({
      value: i.toString(),
      label: `${i}:00 (${i === 0 ? '12' : i > 12 ? i - 12 : i}${i < 12 ? 'AM' : 'PM'})`
    })),
    { value: '*/2', label: 'Every 2 hours' },
    { value: '*/6', label: 'Every 6 hours' },
    { value: '*/12', label: 'Every 12 hours' }
  ];

  const dayOptions = [
    { value: '*', label: 'Every day' },
    ...Array.from({ length: 31 }, (_, i) => ({
      value: (i + 1).toString(),
      label: `${i + 1}${getOrdinalSuffix(i + 1)}`
    })),
    { value: '*/7', label: 'Every 7 days' },
    { value: '1,15', label: '1st and 15th' }
  ];

  const monthOptions = [
    { value: '*', label: 'Every month' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
    { value: '*/3', label: 'Every 3 months' },
    { value: '*/6', label: 'Every 6 months' }
  ];

  const weekdayOptions = [
    { value: '*', label: 'Every day' },
    { value: '0', label: 'Sunday' },
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' },
    { value: '1-5', label: 'Weekdays (Mon-Fri)' },
    { value: '0,6', label: 'Weekends (Sat-Sun)' }
  ];

  const actionTypes = [
    { value: 'shell', label: 'RUN SHELL SCRIPT' },
    { value: 'python', label: 'RUN PYTHON SCRIPT' },
    { value: 'node', label: 'RUN NODE.JS SCRIPT' },
    { value: 'http', label: 'SEND HTTP REQUEST (CURL)' },
    { value: 'webhook', label: 'TRIGGER WEBHOOK' },
    { value: 'docker', label: 'RUN DOCKER CONTAINER' },
    { value: 'custom', label: 'CUSTOM COMMAND' }
  ];

  const presets: Preset[] = [
    {
      name: 'BACKUP DATABASE',
      description: 'Daily database backup at 2 AM',
      cron: { minute: '0', hour: '2', day: '*', month: '*', weekday: '*' },
      action: { type: 'shell', scriptPath: '/scripts/backup-db.sh' }
    },
    {
      name: 'SEND HEARTBEAT',
      description: 'Health check every 5 minutes',
      cron: { minute: '*/5', hour: '*', day: '*', month: '*', weekday: '*' },
      action: { type: 'http', url: 'https://api.healthcheck.io/ping', method: 'GET' }
    },
    {
      name: 'ROTATE LOGS',
      description: 'Weekly log rotation on Sundays',
      cron: { minute: '0', hour: '3', day: '*', month: '*', weekday: '0' },
      action: { type: 'shell', scriptPath: '/usr/sbin/logrotate /etc/logrotate.conf' }
    },
    {
      name: 'CLEAR TEMP FILES',
      description: 'Daily cleanup at midnight',
      cron: { minute: '0', hour: '0', day: '*', month: '*', weekday: '*' },
      action: { type: 'shell', scriptPath: 'find /tmp -type f -mtime +7 -delete' }
    }
  ];

  function getOrdinalSuffix(num: number): string {
    if (num > 3 && num < 21) return 'th';
    switch (num % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }

  function translateToEnglish(cron: CronState): string {
    const { minute, hour, day, month, weekday } = cron;
    
    if (minute === '*' && hour === '*' && day === '*' && month === '*' && weekday === '*') {
      return 'Every minute';
    }
    
    let parts: string[] = [];
    
    // Build the translation
    if (weekday !== '*') {
      const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      if (weekday === '1-5') {
        parts.push('weekdays');
      } else if (weekday === '0,6') {
        parts.push('weekends');
      } else if (weekday.includes(',')) {
        const days = weekday.split(',').map(d => weekdayNames[parseInt(d)]);
        parts.push(days.join(' and '));
      } else {
        parts.push(`${weekdayNames[parseInt(weekday)]}s`);
      }
    }
    
    if (hour !== '*') {
      if (hour.includes('*/')) {
        parts.push(`every ${hour.split('*/')[1]} hours`);
      } else {
        const hourNum = parseInt(hour);
        const time = hourNum === 0 ? '12:00 AM' : hourNum > 12 ? `${hourNum - 12}:00 PM` : `${hourNum}:00 AM`;
        parts.push(`at ${time}`);
      }
    }
    
    if (minute !== '*' && hour !== '*') {
      // Already handled in hour section
    } else if (minute !== '*') {
      if (minute.includes('*/')) {
        parts.push(`every ${minute.split('*/')[1]} minutes`);
      } else {
        parts.push(`at minute ${minute}`);
      }
    }
    
    if (day !== '*') {
      if (day.includes('*/')) {
        parts.push(`every ${day.split('*/')[1]} days`);
      } else if (day === '1,15') {
        parts.push('on the 1st and 15th');
      } else {
        parts.push(`on the ${day}${getOrdinalSuffix(parseInt(day))}`);
      }
    }
    
    if (month !== '*') {
      const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      if (month.includes('*/')) {
        parts.push(`every ${month.split('*/')[1]} months`);
      } else {
        parts.push(`in ${monthNames[parseInt(month)]}`);
      }
    }
    
    return parts.length > 0 ? `Every ${parts.join(' ')}` : 'Custom schedule';
  }

  function generateCommand(): string {
    const cronPart = `${cronState.minute} ${cronState.hour} ${cronState.day} ${cronState.month} ${cronState.weekday}`;
    
    switch (actionConfig.type) {
      case 'shell':
        return `${cronPart} ${actionConfig.scriptPath || '/path/to/script.sh'}`;
      case 'python':
        if (actionConfig.scriptFile) {
          return `${cronPart} python ${actionConfig.scriptFile}`;
        } else {
          return `${cronPart} python -c "${actionConfig.scriptContent || 'print(\\"Hello World\\")'}"`;
        }
      case 'node':
        if (actionConfig.scriptFile) {
          return `${cronPart} node ${actionConfig.scriptFile}`;
        } else {
          return `${cronPart} node -e "${actionConfig.scriptContent || 'console.log(\\"Hello World\\")'}"`;
        }
      case 'http':
        const method = actionConfig.method || 'GET';
        const url = actionConfig.url || 'https://example.com';
        let curlCmd = `curl -X ${method} ${url}`;
        if (actionConfig.headers) {
          curlCmd += ` -H "${actionConfig.headers}"`;
        }
        if (actionConfig.body && method !== 'GET') {
          curlCmd += ` -d '${actionConfig.body}'`;
        }
        return `${cronPart} ${curlCmd}`;
      case 'webhook':
        const webhookUrl = actionConfig.webhookUrl || 'https://hooks.example.com/webhook';
        const payload = actionConfig.payload || '{"status":"ok"}';
        return `${cronPart} curl -X POST ${webhookUrl} -H "Content-Type: application/json" -d '${payload}'`;
      case 'docker':
        const image = actionConfig.image || 'alpine:latest';
        const args = actionConfig.containerArgs || 'echo \\"Hello from Docker\\"';
        return `${cronPart} docker run --rm ${image} ${args}`;
      case 'custom':
        return `${cronPart} ${actionConfig.command || 'echo \\"Custom command\\"'}`;
      default:
        return cronPart;
    }
  }

  function generateFullTranslation(): string {
    const timeTranslation = translateToEnglish(cronState);
    
    switch (actionConfig.type) {
      case 'shell':
        return `Run shell script ${timeTranslation.toLowerCase()}`;
      case 'python':
        return `Execute Python script ${timeTranslation.toLowerCase()}`;
      case 'node':
        return `Execute Node.js script ${timeTranslation.toLowerCase()}`;
      case 'http':
        const method = actionConfig.method || 'GET';
        const domain = actionConfig.url ? new URL(actionConfig.url).hostname : 'example.com';
        return `Send ${method} request to ${domain} ${timeTranslation.toLowerCase()}`;
      case 'webhook':
        const webhookDomain = actionConfig.webhookUrl ? new URL(actionConfig.webhookUrl).hostname : 'hooks.example.com';
        return `Trigger webhook to ${webhookDomain} ${timeTranslation.toLowerCase()}`;
      case 'docker':
        const image = actionConfig.image || 'alpine:latest';
        return `Run Docker container (${image}) ${timeTranslation.toLowerCase()}`;
      case 'custom':
        return `Execute custom command ${timeTranslation.toLowerCase()}`;
      default:
        return timeTranslation;
    }
  }

  useEffect(() => {
    const newCronString = `${cronState.minute} ${cronState.hour} ${cronState.day} ${cronState.month} ${cronState.weekday}`;
    setCronString(newCronString);
    setEnglishTranslation(translateToEnglish(cronState));
    setFullCommand(generateCommand());
    setFullTranslation(generateFullTranslation());
  }, [cronState, actionConfig]);

  const handleFieldChange = (field: keyof CronState, value: string) => {
    setCronState(prev => ({ ...prev, [field]: value }));
  };

  const handleActionTypeChange = (type: string) => {
    setSelectedAction(type);
    
    // Reset action config with defaults for the selected type
    const defaultConfigs: Record<string, ActionConfig> = {
      shell: { type: 'shell', scriptPath: '/path/to/script.sh' },
      python: { type: 'python', scriptFile: '/path/to/script.py' },
      node: { type: 'node', scriptFile: '/path/to/script.js' },
      http: { type: 'http', url: 'https://example.com', method: 'GET' },
      webhook: { type: 'webhook', webhookUrl: 'https://hooks.example.com/webhook', payload: '{"status":"ok"}' },
      docker: { type: 'docker', image: 'alpine:latest', containerArgs: 'echo \\"Hello from Docker\\"' },
      custom: { type: 'custom', command: 'echo \\"Custom command\\"' }
    };
    
    setActionConfig(defaultConfigs[type] || defaultConfigs.shell);
  };

  const handleActionConfigChange = (field: keyof ActionConfig, value: string) => {
    setActionConfig(prev => ({ ...prev, [field]: value }));
  };

  const loadPreset = (preset: Preset) => {
    setCronState(preset.cron);
    setSelectedAction(preset.action.type);
    setActionConfig(preset.action);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullCommand);
  };

  const downloadAsScript = () => {
    const script = `#!/bin/bash\n# Cron job generated by Cron Composer\n# Description: ${fullTranslation}\n# Add this to your crontab:\n# ${fullCommand}\n\necho "Cron job executed at $(date)"\n`;
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cronjob.sh';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setCronState({
      minute: '*',
      hour: '*',
      day: '*',
      month: '*',
      weekday: '*'
    });
    handleActionTypeChange('shell');
  };

  // Render action configuration form
  const renderActionConfig = () => {
    switch (selectedAction) {
      case 'shell':
        return (
          <div className="space-y-4">
            <div>
              <label className="block mb-1" style={{ fontFamily: 'Times, serif' }}>SCRIPT PATH:</label>
              <input
                type="text"
                value={actionConfig.scriptPath || ''}
                onChange={(e) => handleActionConfigChange('scriptPath', e.target.value)}
                className="w-full border border-black p-2 bg-white text-black"
                style={{ fontFamily: 'Courier, monospace' }}
                placeholder="/path/to/script.sh"
              />
            </div>
          </div>
        );
      
      case 'python':
        return (
          <div className="space-y-4">
            <div>
              <label className="block mb-1" style={{ fontFamily: 'Times, serif' }}>SCRIPT FILE:</label>
              <input
                type="text"
                value={actionConfig.scriptFile || ''}
                onChange={(e) => handleActionConfigChange('scriptFile', e.target.value)}
                className="w-full border border-black p-2 bg-white text-black"
                style={{ fontFamily: 'Courier, monospace' }}
                placeholder="/path/to/script.py"
              />
            </div>
            <div>
              <label className="block mb-1" style={{ fontFamily: 'Times, serif' }}>OR INLINE CODE:</label>
              <textarea
                value={actionConfig.scriptContent || ''}
                onChange={(e) => handleActionConfigChange('scriptContent', e.target.value)}
                className="w-full border border-black p-2 bg-white text-black h-20"
                style={{ fontFamily: 'Courier, monospace' }}
                placeholder="print('Hello World')"
              />
            </div>
          </div>
        );
      
      case 'node':
        return (
          <div className="space-y-4">
            <div>
              <label className="block mb-1" style={{ fontFamily: 'Times, serif' }}>SCRIPT FILE:</label>
              <input
                type="text"
                value={actionConfig.scriptFile || ''}
                onChange={(e) => handleActionConfigChange('scriptFile', e.target.value)}
                className="w-full border border-black p-2 bg-white text-black"
                style={{ fontFamily: 'Courier, monospace' }}
                placeholder="/path/to/script.js"
              />
            </div>
            <div>
              <label className="block mb-1" style={{ fontFamily: 'Times, serif' }}>OR INLINE CODE:</label>
              <textarea
                value={actionConfig.scriptContent || ''}
                onChange={(e) => handleActionConfigChange('scriptContent', e.target.value)}
                className="w-full border border-black p-2 bg-white text-black h-20"
                style={{ fontFamily: 'Courier, monospace' }}
                placeholder="console.log('Hello World')"
              />
            </div>
          </div>
        );
      
      case 'http':
        return (
          <div className="space-y-4">
            <div>
              <label className="block mb-1" style={{ fontFamily: 'Times, serif' }}>URL:</label>
              <input
                type="text"
                value={actionConfig.url || ''}
                onChange={(e) => handleActionConfigChange('url', e.target.value)}
                className="w-full border border-black p-2 bg-white text-black"
                style={{ fontFamily: 'Courier, monospace' }}
                placeholder="https://example.com/api"
              />
            </div>
            <div>
              <label className="block mb-1" style={{ fontFamily: 'Times, serif' }}>METHOD:</label>
              <select
                value={actionConfig.method || 'GET'}
                onChange={(e) => handleActionConfigChange('method', e.target.value)}
                className="w-full border border-black p-2 bg-white text-black"
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div>
              <label className="block mb-1" style={{ fontFamily: 'Times, serif' }}>HEADERS:</label>
              <input
                type="text"
                value={actionConfig.headers || ''}
                onChange={(e) => handleActionConfigChange('headers', e.target.value)}
                className="w-full border border-black p-2 bg-white text-black"
                style={{ fontFamily: 'Courier, monospace' }}
                placeholder="Content-Type: application/json"
              />
            </div>
            <div>
              <label className="block mb-1" style={{ fontFamily: 'Times, serif' }}>BODY:</label>
              <textarea
                value={actionConfig.body || ''}
                onChange={(e) => handleActionConfigChange('body', e.target.value)}
                className="w-full border border-black p-2 bg-white text-black h-20"
                style={{ fontFamily: 'Courier, monospace' }}
                placeholder='{"key": "value"}'
              />
            </div>
          </div>
        );
      
      case 'webhook':
        return (
          <div className="space-y-4">
            <div>
              <label className="block mb-1" style={{ fontFamily: 'Times, serif' }}>WEBHOOK URL:</label>
              <input
                type="text"
                value={actionConfig.webhookUrl || ''}
                onChange={(e) => handleActionConfigChange('webhookUrl', e.target.value)}
                className="w-full border border-black p-2 bg-white text-black"
                style={{ fontFamily: 'Courier, monospace' }}
                placeholder="https://hooks.example.com/webhook"
              />
            </div>
            <div>
              <label className="block mb-1" style={{ fontFamily: 'Times, serif' }}>PAYLOAD:</label>
              <textarea
                value={actionConfig.payload || ''}
                onChange={(e) => handleActionConfigChange('payload', e.target.value)}
                className="w-full border border-black p-2 bg-white text-black h-20"
                style={{ fontFamily: 'Courier, monospace' }}
                placeholder='{"status": "ok", "timestamp": "now"}'
              />
            </div>
          </div>
        );
      
      case 'docker':
        return (
          <div className="space-y-4">
            <div>
              <label className="block mb-1" style={{ fontFamily: 'Times, serif' }}>DOCKER IMAGE:</label>
              <input
                type="text"
                value={actionConfig.image || ''}
                onChange={(e) => handleActionConfigChange('image', e.target.value)}
                className="w-full border border-black p-2 bg-white text-black"
                style={{ fontFamily: 'Courier, monospace' }}
                placeholder="alpine:latest"
              />
            </div>
            <div>
              <label className="block mb-1" style={{ fontFamily: 'Times, serif' }}>CONTAINER ARGS:</label>
              <input
                type="text"
                value={actionConfig.containerArgs || ''}
                onChange={(e) => handleActionConfigChange('containerArgs', e.target.value)}
                className="w-full border border-black p-2 bg-white text-black"
                style={{ fontFamily: 'Courier, monospace' }}
                placeholder='echo "Hello from Docker"'
              />
            </div>
          </div>
        );
      
      case 'custom':
        return (
          <div className="space-y-4">
            <div>
              <label className="block mb-1" style={{ fontFamily: 'Times, serif' }}>COMMAND:</label>
              <input
                type="text"
                value={actionConfig.command || ''}
                onChange={(e) => handleActionConfigChange('command', e.target.value)}
                className="w-full border border-black p-2 bg-white text-black"
                style={{ fontFamily: 'Courier, monospace' }}
                placeholder="echo 'Custom command'"
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Presets */}
      <div className="border-2 border-black p-4">
        <label className="block mb-4" style={{ fontFamily: 'Times, serif' }}>
          QUICK PRESETS:
        </label>
        <div className="grid grid-cols-4 gap-4">
          {presets.map((preset, index) => (
            <button
              key={index}
              onClick={() => loadPreset(preset)}
              className="border border-black p-3 bg-white text-black hover:bg-black hover:text-white transition-colors text-left"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              <div className="text-xs mb-1">{preset.name}</div>
              <div className="text-xs opacity-75">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Preview Pane */}
      <div className="border-2 border-black p-4">
        <label className="block mb-2" style={{ fontFamily: 'Times, serif' }}>
          COMPLETE COMMAND PREVIEW:
        </label>
        <div 
          className="border border-black p-4 bg-white text-black text-lg mb-4"
          style={{ fontFamily: 'Courier, monospace' }}
        >
          {fullCommand}
        </div>
        <label className="block mb-2" style={{ fontFamily: 'Times, serif' }}>
          DESCRIPTION:
        </label>
        <div 
          className="border border-black p-4 bg-white text-black"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          {fullTranslation}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-4 gap-8">
        
        {/* Left Column - Timing Fields */}
        <div className="col-span-2 space-y-6">
          <div className="border-2 border-black p-4">
            <label className="block mb-4" style={{ fontFamily: 'Times, serif' }}>
              TIMING CONFIGURATION:
            </label>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Minute */}
              <div>
                <label className="block mb-1" style={{ fontFamily: 'Times, serif' }}>MINUTE:</label>
                <select 
                  value={cronState.minute}
                  onChange={(e) => handleFieldChange('minute', e.target.value)}
                  className="w-full border border-black p-2 bg-white text-black"
                  style={{ fontFamily: 'Arial, sans-serif' }}
                >
                  {minuteOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hour */}
              <div>
                <label className="block mb-1" style={{ fontFamily: 'Times, serif' }}>HOUR:</label>
                <select 
                  value={cronState.hour}
                  onChange={(e) => handleFieldChange('hour', e.target.value)}
                  className="w-full border border-black p-2 bg-white text-black"
                  style={{ fontFamily: 'Arial, sans-serif' }}
                >
                  {hourOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Day */}
              <div>
                <label className="block mb-1" style={{ fontFamily: 'Times, serif' }}>DAY:</label>
                <select 
                  value={cronState.day}
                  onChange={(e) => handleFieldChange('day', e.target.value)}
                  className="w-full border border-black p-2 bg-white text-black"
                  style={{ fontFamily: 'Arial, sans-serif' }}
                >
                  {dayOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month */}
              <div>
                <label className="block mb-1" style={{ fontFamily: 'Times, serif' }}>MONTH:</label>
                <select 
                  value={cronState.month}
                  onChange={(e) => handleFieldChange('month', e.target.value)}
                  className="w-full border border-black p-2 bg-white text-black"
                  style={{ fontFamily: 'Arial, sans-serif' }}
                >
                  {monthOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Weekday - Full Width */}
            <div>
              <label className="block mb-1" style={{ fontFamily: 'Times, serif' }}>WEEKDAY:</label>
              <select 
                value={cronState.weekday}
                onChange={(e) => handleFieldChange('weekday', e.target.value)}
                className="w-full border border-black p-2 bg-white text-black"
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                {weekdayOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right Column - Action Library */}
        <div className="col-span-2 space-y-6">
          <div className="border-2 border-black p-4">
            <label className="block mb-4" style={{ fontFamily: 'Times, serif' }}>
              ACTION LIBRARY:
            </label>
            
            {/* Action Type Selector */}
            <div className="mb-6">
              <label className="block mb-2" style={{ fontFamily: 'Times, serif' }}>SELECT ACTION TYPE:</label>
              <select
                value={selectedAction}
                onChange={(e) => handleActionTypeChange(e.target.value)}
                className="w-full border border-black p-2 bg-white text-black"
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                {actionTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Configuration */}
            <div className="border border-black p-4">
              <label className="block mb-3" style={{ fontFamily: 'Times, serif' }}>
                CONFIGURATION:
              </label>
              {renderActionConfig()}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Buttons */}
      <div className="border-t-2 border-black pt-8">
        <div className="flex gap-4">
          <button
            onClick={copyToClipboard}
            className="border-2 border-black px-6 py-3 bg-white text-black hover:bg-black hover:text-white transition-colors"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            [COPY FULL COMMAND]
          </button>
          <button
            onClick={downloadAsScript}
            className="border-2 border-black px-6 py-3 bg-white text-black hover:bg-black hover:text-white transition-colors"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            [DOWNLOAD AS .SH]
          </button>
          <button
            onClick={clearAll}
            className="border-2 border-black px-6 py-3 bg-white text-black hover:bg-black hover:text-white transition-colors"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            [CLEAR ALL]
          </button>
        </div>
      </div>
    </div>
  );
}