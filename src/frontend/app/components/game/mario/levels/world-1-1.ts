import { buildCourse } from './campaign-course'

/**
 * Build the editable terrain and encounters for world 1-1.
 * @returns {import('../level-format').LevelData} The campaign course.
 */
export function createWorld1Dash1Level() {
  return buildCourse({
    description: 'Utform forslaget sammen med representantene og lever det med ønsket dato for fremsetting.',
    rows: {
      7: '                                 ooo',
      8: '           o                  BBBB                  o',
      9: '     o    BBB       m   ooo                      oo',
      10: '    ooo         g   PP                 g        BBB      o',
      11: '#########################  ###############################',
    },
    stage: 1,
    theme: 'overworld',
  })
}
