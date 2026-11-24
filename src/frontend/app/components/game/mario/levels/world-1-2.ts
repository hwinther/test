import { buildCourse } from './campaign-course'

/**
 * Build the editable terrain and encounters for world 1-2.
 * @returns {import('../level-format').LevelData} The campaign course.
 */
export function createWorld1Dash2Level() {
  return buildCourse({
    description:
      'Følg forslaget fra datovurdering og dagsorden til fremsetting, komitétildeling og midlertidig publisering.',
    rows: {
      6: '                               f                       ooo',
      7: '                  ooo         ===                     ====',
      8: '         o       ====     o         ooo       ooo',
      9: '        BB               BB        ====                  m',
      10: '      m       g        PP                 BB       k     PP',
      11: '#################  ###########   ###########  ##################',
    },
    stage: 2,
    theme: 'underground',
  })
}
