import type { MarioGameState } from './mario-types'

export const BOTVAR_STAGE_TITLES = ['Utforming og levering', 'Fremsetting', 'Korrektur og publisering'] as const

interface BotvarMilestone {
  readonly title: string
  readonly detail: string
}

interface BotvarStation extends BotvarMilestone {
  readonly fraction: number
  readonly scene:
    | 'author'
    | 'signers'
    | 'presenter'
    | 'calendar'
    | 'check'
    | 'agenda'
    | 'meeting'
    | 'committee'
    | 'temporary'
    | 'approver'
    | 'publish'
}

const stations: readonly (readonly BotvarStation[])[] = [
  [
    {
      detail:
        'Ada lager et utkast om skolebibliotek. Fram til levering kan hun endre både teksten og hvem som står bak.',
      fraction: 0,
      scene: 'author',
      title: 'Representanten redigerer',
    },
    {
      detail: 'Ada endrer teksten sammen med Iver. Nå står begge som forslagsstillere.',
      fraction: 0.32,
      scene: 'signers',
      title: 'Forslagsstillere',
    },
    {
      detail:
        'Ada og Iver leverer forslaget med ønsket møtedato. På forsiden står Ada som representanten som skal fremsette det.',
      fraction: 0.64,
      scene: 'presenter',
      title: 'Klar til levering',
    },
  ],
  [
    {
      detail: 'Første saksbehandler vurderer om Ada kan fremsette forslaget på ønsket dato. Det er plass på møtet.',
      fraction: 0,
      scene: 'calendar',
      title: 'Ønsket møtedato',
    },
    {
      detail: 'Saksbehandleren sjekker at teksten og navnene er på plass.',
      fraction: 0.16,
      scene: 'check',
      title: 'Hurtigsjekk',
    },
    {
      detail: 'Representantforslaget settes opp på dagsordenen for møtet.',
      fraction: 0.32,
      scene: 'agenda',
      title: 'Dagsorden',
    },
    {
      detail: 'Ada fremsetter forslaget fra talerstolen i stortingsmøtet.',
      fraction: 0.48,
      scene: 'meeting',
      title: 'Møte',
    },
    {
      detail: 'Etter møtet tildeles forslaget om skolebibliotek til komiteen som arbeider med utdanning.',
      fraction: 0.64,
      scene: 'committee',
      title: 'Komité',
    },
    {
      detail: 'Ta forslaget til terminalen for å vise den foreløpige versjonen.',
      fraction: 0.8,
      scene: 'temporary',
      title: 'Midlertidig publisering',
    },
  ],
  [
    {
      detail: 'En tredje saksbehandler går gjennom den korrekturleste versjonen.',
      fraction: 0,
      scene: 'approver',
      title: 'Endelig godkjenning',
    },
    {
      detail: 'Saksbehandleren har godkjent teksten. Ta den til terminalen for endelig publisering.',
      fraction: 0.57,
      scene: 'publish',
      title: 'Endelig publisering',
    },
  ],
]

const proofreading: BotvarMilestone = {
  detail: 'En annen saksbehandler leser korrektur. Finn rettelsene før du sender teksten til godkjenning.',
  title: 'Korrektur',
}

const readyForApproval = {
  title: 'Klar til godkjenning',
  detail: 'Begge rettelsene er gjort. Gå til utgangen og lever dokumentet til den tredje saksbehandleren.',
}

const completion: readonly BotvarMilestone[] = [
  {
    detail: 'Saksbehandleren har mottatt forslaget fra Ada og Iver. Ada skal fremsette det.',
    title: 'Forslaget er levert',
  },
  {
    detail: 'Forslaget er nå synlig på stortinget.no. En annen saksbehandler skal lese korrektur.',
    title: 'Midlertidig publisert på stortinget.no',
  },
  {
    detail: 'Dokument 8 er endelig publisert. Sak opprettet. Det ferdige forslaget er tilgjengelig på stortinget.no.',
    title: 'Saken er opprettet',
  },
]

/**
 * Get the stations on the current campaign course.
 * @param {MarioGameState} state - Active course.
 * @returns {readonly BotvarStation[]} Stations ordered along the route.
 */
export function getBotvarStations(state: MarioGameState): readonly BotvarStation[] {
  return stations[state.level - 1] ?? stations[0]
}

/**
 * Map a station to the course coordinate where its milestone begins.
 * @param {MarioGameState} state - Active course.
 * @param {BotvarStation} station - One stop along the route.
 * @returns {number} The world x coordinate.
 */
export function getBotvarStationX(state: MarioGameState, station: BotvarStation): number {
  const start = state.spawnPosition.x
  return Math.round(start + station.fraction * (state.flagPole.x - start))
}

/**
 * Describe the player's current stop in the campaign.
 * @param {MarioGameState} state - Active course or proofreading room.
 * @returns {BotvarMilestone} The current narrative card.
 */
export function getBotvarMilestone(state: MarioGameState): BotvarMilestone {
  if (state.proofroom) return state.proofroom.marks.every((mark) => mark.collected) ? readyForApproval : proofreading
  if (state.flagPole.reached) return completion[state.level - 1] ?? completion[0]

  const stops = getBotvarStations(state)
  const playerX = state.furthestX
  return stops.findLast((station) => playerX >= getBotvarStationX(state, station)) ?? stops[0]
}
