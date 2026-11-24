import { buildCourse } from './campaign-course'

/**
 * Build the editable terrain and encounters for world 1-3.
 * @returns {import('../level-format').LevelData} The campaign course.
 */
export function createWorld1Dash3Level() {
  return buildCourse({
    description: 'Les korrektur, send til godkjenning og publiser den endelige utgaven av Dokument 8.',
    rows: {
      6: '                               *                ooo',
      7: '                   oo          BB              ====',
      8: '          oo      ===               ooo                  f',
      9: '      m   BB             ^oo       ====       BB        BB',
      10: '      PP       g       PPPP              k          g      oo',
      11: '#################  ##########   ##########  #####################',
    },
    stage: 3,
    theme: 'castle',
  })
}
