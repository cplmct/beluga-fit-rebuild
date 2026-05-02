export type VoiceCommand =
  | { type: 'START_WORKOUT' }
  | { type: 'LOG_WEIGHT' }
  | { type: 'SHOW_TODAY_WORKOUT' }
  | { type: 'ADD_SET' }
  | { type: 'FINISH_WORKOUT' }
  | { type: 'OPEN_BODY_TRACKER' }
  | { type: 'START_REST_TIMER' }
  | { type: 'GENERATE_WORKOUT_PLAN' }
  | { type: 'SAVE_WORKOUT_PLAN' }
  | { type: 'UNKNOWN'; text: string };

const commandPatterns: Array<{ pattern: RegExp; type: VoiceCommand['type'] }> = [
  { pattern: /start\s+(a\s+)?workout/i, type: 'START_WORKOUT' },
  { pattern: /begin\s+(a\s+)?workout/i, type: 'START_WORKOUT' },
  { pattern: /log\s+(my\s+)?weight/i, type: 'LOG_WEIGHT' },
  { pattern: /record\s+(my\s+)?weight/i, type: 'LOG_WEIGHT' },
  { pattern: /enter\s+(my\s+)?weight/i, type: 'LOG_WEIGHT' },
  { pattern: /show\s+(today'?s?|todays)\s+workout/i, type: 'SHOW_TODAY_WORKOUT' },
  { pattern: /today'?s?\s+workout/i, type: 'SHOW_TODAY_WORKOUT' },
  { pattern: /add\s+(a\s+)?set/i, type: 'ADD_SET' },
  { pattern: /next\s+set/i, type: 'ADD_SET' },
  { pattern: /complete\s+set/i, type: 'ADD_SET' },
  { pattern: /finish\s+(the\s+)?workout/i, type: 'FINISH_WORKOUT' },
  { pattern: /complete\s+(the\s+)?workout/i, type: 'FINISH_WORKOUT' },
  { pattern: /end\s+(the\s+)?workout/i, type: 'FINISH_WORKOUT' },
  { pattern: /open\s+body\s+tracker/i, type: 'OPEN_BODY_TRACKER' },
  { pattern: /go\s+to\s+body\s+tracker/i, type: 'OPEN_BODY_TRACKER' },
  { pattern: /start\s+rest\s+timer/i, type: 'START_REST_TIMER' },
  { pattern: /rest\s+timer/i, type: 'START_REST_TIMER' },
  { pattern: /take\s+(a\s+)?rest/i, type: 'START_REST_TIMER' },
  { pattern: /generate\s+(a\s+)?workout\s+plan/i, type: 'GENERATE_WORKOUT_PLAN' },
  { pattern: /create\s+(a\s+)?workout\s+plan/i, type: 'GENERATE_WORKOUT_PLAN' },
  { pattern: /ai\s+(workout\s+)?coach/i, type: 'GENERATE_WORKOUT_PLAN' },
  { pattern: /open\s+ai\s+coach/i, type: 'GENERATE_WORKOUT_PLAN' },
  { pattern: /save\s+(my\s+)?(workout\s+)?plan/i, type: 'SAVE_WORKOUT_PLAN' },
  { pattern: /save\s+plan/i, type: 'SAVE_WORKOUT_PLAN' },
  { pattern: /store\s+(my\s+)?plan/i, type: 'SAVE_WORKOUT_PLAN' },
  { pattern: /keep\s+(this\s+)?plan/i, type: 'SAVE_WORKOUT_PLAN' },

];

export function parseVoiceCommand(transcript: string): VoiceCommand {
  const normalizedText = transcript.trim();

  for (const { pattern, type } of commandPatterns) {
    if (pattern.test(normalizedText)) {
      return { type } as VoiceCommand;
    }
  }

  return { type: 'UNKNOWN', text: normalizedText };
}

export function getCommandDescription(command: VoiceCommand): string {
  switch (command.type) {
    case 'START_WORKOUT':
      return 'Starting workout';
    case 'LOG_WEIGHT':
      return 'Opening weight log';
    case 'SHOW_TODAY_WORKOUT':
      return 'Showing today\'s workout';
    case 'ADD_SET':
      return 'Adding set';
    case 'FINISH_WORKOUT':
      return 'Finishing workout';
    case 'OPEN_BODY_TRACKER':
      return 'Opening body tracker';
    case 'START_REST_TIMER':
      return 'Starting rest timer';
    case 'GENERATE_WORKOUT_PLAN':
      return 'Opening AI Coach';
	case 'SAVE_WORKOUT_PLAN':
	  return 'Saving workout plan';
    case 'UNKNOWN':
      return `Command not recognized: "${command.text}"`;
    default:
      return 'Unknown command';
  }
}
