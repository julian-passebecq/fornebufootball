// Source-fidelity layer for the coach's original "Gardien" brief.
// It enriches only untouched/default copy. Any field already changed by the coach
// is deliberately preserved.
export const COACH_SOURCE_VERSION = 1

const OLD_FR_GLOBAL = {
  start: 'Lever la tête et jouer simple.\nSe déplacer après la passe ; le milieu doit toujours être disponible.',
  attack: "Les ailiers restent larges et utilisent les espaces libres.\nL'attaquant prend la profondeur ; après récupération, chercher rapidement une passe vers l'avant.",
  defend: 'Revenir vite, marquer un adversaire et communiquer.\nLe joueur le plus proche presse ; les autres ferment les lignes de passe et les espaces.',
  transition: 'À la perte : réagir immédiatement pendant 5 secondes.\nÀ la récupération : lever la tête, chercher vers l’avant et utiliser les ailes.',
  mindset: 'Croire que tu peux le faire.\nPlus tu crois en toi, mieux tu joueras.',
}

const OLD_EN_GLOBAL = {
  start: 'Head up and keep it simple.\nMove after your pass; the midfielder must stay available.',
  attack: 'Wingers stay wide and use open space.\nThe striker runs in behind; look forward early after regaining the ball.',
  defend: 'Recover quickly, mark an opponent and communicate.\nThe closest player presses; teammates close passing lanes and spaces.',
  transition: 'Lose it: react immediately for 5 seconds.\nWin it: lift your head, look forward and use the wings.',
  mindset: 'Believe you can do it.\nThe better you think about yourself, the better you perform.',
}

const SOURCE_GLOBAL = {
  start: {
    fr: 'Lever la tête.\nJouer simple.\nSe déplacer après la passe.',
    en: 'Head up.\nKeep it simple.\nMove after your pass.',
  },
  attack: {
    fr: 'Largeur et soutien.\nLes ailiers restent larges (IN / OUT).\nLe milieu est toujours disponible pour une passe.\nL’attaquant fait des appels dans le dos de la défense.',
    en: 'Width and support.\nWingers stay wide (IN / OUT).\nThe midfielder is always available for a pass.\nThe striker makes runs in behind the defense.',
  },
  defend: {
    fr: 'Revenir rapidement.\nMarquer un adversaire.\nCommuniquer.',
    en: 'Recover quickly.\nMark an opponent.\nCommunicate.',
  },
  transition: {
    fr: 'À la perte du ballon : réagir immédiatement pendant 5 secondes.\nLe joueur le plus proche presse.\nLes coéquipiers ferment les lignes de passe et les espaces.\nÀ la récupération : lever la tête, chercher une passe vers l’avant et utiliser les ailes et les espaces libres.',
    en: 'When we lose the ball: react immediately for 5 seconds.\nThe closest player presses.\nTeammates close down passing lanes and spaces.\nWhen we win the ball: lift your head, look for a forward pass, and use the wings and open spaces.',
  },
  mindset: {
    fr: 'Plus tu penses positivement à toi-même, mieux tu joueras.\nCrois que tu peux le faire.',
    en: 'The better you think about yourself, the better you will do.\nBelieve that you can do it.',
  },
}

const OLD_FR = {
  goalkeeper: {
    role:'Gardien',
    possession:"Jouer court au pied quand c'est possible.\nSous pression, se dégager proprement et loin du danger.",
    defence:'Protéger les cages et lire le jeu tôt.\nDiriger et replacer sa défense.',
    transition:'Sur ballon en retrait ou avec une ligne haute, relancer vite pour éloigner le danger.\nAnticiper et réagir rapidement.',
    cue:'Être décisif, communiquer et organiser.',
  },
  fullBack: {
    possession:'Participer à la relance.\nMonter dans le couloir pour créer le surnombre et centrer.',
    defence:'Fermer le couloir et empêcher les centres.\nProtéger d’abord l’intérieur.',
    transition:'Revenir vite, puis offrir une solution large à la récupération.',
    cue:'Soutenir l’attaque sans laisser le couloir ouvert.',
  },
  stopper: {
    role:'Défenseur central stoppeur',
    possession:'Après récupération, relancer proprement.\nChercher une passe sûre vers l’avant.',
    defence:'Assurer la couverture et marquer l’attaquant de pointe.\nCouper l’axe et orienter le jeu vers les côtés.',
    transition:'Anticiper tôt et intercepter avant que le danger augmente.',
    cue:'Protéger l’axe en priorité.',
  },
  defMid: {
    possession:'Recevoir les ballons de la défense et relier le jeu.\nÉlargir le jeu et jouer sur les côtés ou verticalement.',
    defence:'Couvrir l’axe et les côtés.\nCouper les lignes de passe et protéger la défense.',
    transition:'Assurer la transition défense-attaque et réagir vite sur les deuxièmes ballons.',
    cue:'Stabiliser le bloc équipe.',
  },
  centralMid: {
    role:'Milieu central',
    possession:'Créer et orienter le jeu avec peu de touches.\nJouer court sous pression ; changer de côté ou jouer en profondeur quand l’espace s’ouvre.',
    defence:'Couvrir l’axe et aider à fermer les couloirs.\nSoutenir la défense sous pression.',
    transition:'Trouver rapidement l’espace et chercher la passe décisive.',
    cue:'Scanner avant de recevoir et rester disponible.',
  },
  winger: {
    possession:'Soutenir l’avant-centre et attaquer le couloir.\nFaire des courses diagonales et jouer dans la profondeur.',
    defence:'Être parmi les premiers à défendre.\nPresser la relance adverse et bloquer la sortie côté.',
    transition:'Partir vite en contre et jouer le deuxième ballon autour de l’attaquant.',
    cue:'Protéger son côté et soutenir l’attaquant.',
  },
  striker: {
    role:'Avant-centre',
    possession:'Être décisif devant le but.\nMaîtriser le timing des appels ; attaquer verticalement ou en diagonale.',
    defence:'Déclencher le pressing et rendre la première passe adverse difficile.',
    transition:'Accélérer dans l’espace à la récupération.\nLire où le ballon va arriver.',
    cue:'Marquer des buts et anticiper les défenseurs.',
  },
}

const SOURCE_ROLES = {
  goalkeeper: {
    role:'Gardien',
    possession:'Jouer court au pied ou se dégager proprement sous pression.\nRelancer les ballons en retrait ou lorsque la défense joue haut afin d’éloigner le danger du but.',
    defence:'Protéger les cages.\nLire le jeu avec justesse.\nDiriger et replacer sa défense avec caractère.',
    transition:'Faire preuve d’anticipation et de rapidité.\nSur ballon en retrait ou défense haute, relancer pour éloigner le danger du but.',
    cue:'Lire le jeu, anticiper vite et diriger sa défense avec caractère.',
  },
  fullBack: {
    possession:'Participer à la relance en phase offensive.\nMonter sur les ailes pour offrir des solutions.\nCréer le surnombre afin de déborder la défense adverse.\nCentrer vers les attaquants.',
    defence:'Fermer les couloirs en phase défensive pour empêcher les centres adverses.',
    transition:'Après récupération, participer rapidement à la relance et offrir une solution sur l’aile.',
    cue:'Créer le surnombre sans laisser son couloir ouvert.',
  },
  stopper: {
    role:'Défenseur central stoppeur',
    possession:'Relancer proprement après la récupération.',
    defence:'Assurer la couverture défensive.\nMarquer l’attaquant de pointe adverse.\nCouper les trajectoires dans l’axe.\nOrienter le jeu vers les côtés.',
    transition:'Anticiper les actions pour intercepter le ballon puis relancer proprement.',
    cue:'Couper les trajectoires dans l’axe et orienter le jeu vers les côtés.',
  },
  defMid: {
    possession:'Récupérer les ballons transmis par la défense.\nAssurer les transitions entre la défense et l’attaque.\nÉlargir le jeu et créer de l’espace.\nStabiliser le bloc équipe afin de donner de bons ballons sur les côtés ou verticalement.',
    defence:'Se déplacer constamment pour couvrir l’axe et les côtés.\nCouper les lignes adverses, récupérer le ballon et protéger la défense.',
    transition:'Assurer les transitions entre la défense et l’attaque.',
    cue:'Stabiliser le bloc équipe et rester disponible.',
  },
  attackingMid: {
    role:'Milieu offensif',
    possession:'Créer et orienter le jeu avec un nombre limité de passes.\nSe positionner entre les attaquants et le reste du milieu de terrain.\nAvoir une bonne vision du jeu et une bonne qualité de dribble.\nJouer court quand il y a un surnombre adverse.\nJouer long pour orienter en profondeur, en diagonale ou en transversale.\nCréer des espaces afin de donner des ballons décisifs sur de bonnes passes.',
    defence:'Travailler défensivement en bloquant les couloirs et les arrières adverses.\nÊtre polyvalent et soutenir sa défense.',
    transition:'Conduire le ballon quand l’espace s’ouvre, soutenir sa défense puis chercher rapidement la passe décisive.',
    cue:'Bonne vision du jeu, polyvalence et qualité de conduite de balle.',
  },
  support11: {
    role:'Offensif de couloir',
    possession:'Protéger son couloir en soutien de l’avant-centre.\nJouer autour du joueur offensif 9 pour jouer le deuxième ballon.\nAssurer des passes en profondeur pour le 9 et faire des courses en diagonale.',
    defence:'Contribuer en premier au travail défensif en bloquant la relance adverse et en pressant pour gêner la transmission du ballon.',
    transition:'Être rapide en contre-attaque et jouer le deuxième ballon autour du 9.',
    cue:'Protéger son couloir et soutenir le 9.',
  },
  striker: {
    role:'Avant-centre',
    possession:'Être efficace devant le but : marquer, marquer, marquer des buts.\nFaire preuve d’explosivité pour prendre de vitesse les défenseurs.\nAvoir le sens du but pour anticiper où le ballon va tomber ou arriver.\nMaîtriser le timing des appels pour ne pas être hors-jeu.\nFaire des courses diagonales pour servir de support aux milieux.\nFaire des courses verticales afin de marquer.',
    defence:'À la perte, participer au pressing immédiat et gêner la première relance adverse.',
    transition:'Anticiper intelligemment sur la défense et exploser dans l’espace dès la récupération.',
    cue:'Marquer, marquer, marquer des buts.',
  },
}

const SOURCE_MAP = {
  '9v9': {
    1:'goalkeeper', 2:'fullBack', 3:'stopper', 4:'fullBack',
    5:'defMid', 6:'attackingMid', 7:'attackingMid', 8:'striker', 9:'support11',
  },
  // 7v7 is an adaptation of the same source brief to the reduced formation.
  '7v7': {
    1:'goalkeeper', 2:'fullBack', 3:'fullBack', 4:'attackingMid',
    5:'support11', 6:'support11', 7:'striker',
  },
}

function maybe(target, lang, oldValue, newValue) {
  if (!target || !newValue) return
  const current = target[lang]
  if (!current || current === oldValue) target[lang] = newValue
}

function oldForRole(kind, sectionKey, currentRole) {
  if (kind === 'goalkeeper') return OLD_FR.goalkeeper[sectionKey]
  if (kind === 'fullBack') return OLD_FR.fullBack[sectionKey]
  if (kind === 'stopper') return OLD_FR.stopper[sectionKey]
  if (kind === 'defMid') return OLD_FR.defMid[sectionKey]
  if (kind === 'attackingMid') {
    // Slot 6 used to be defensive midfield; slot 7 used to be a winger.
    if (sectionKey === 'role') return currentRole
    return null
  }
  if (kind === 'support11') return sectionKey === 'role' ? currentRole : OLD_FR.winger[sectionKey]
  if (kind === 'striker') return OLD_FR.striker[sectionKey]
  return null
}

function legacySectionCandidates(kind, key) {
  if (kind === 'attackingMid') return [OLD_FR.centralMid[key], OLD_FR.defMid[key], OLD_FR.winger[key]].filter(Boolean)
  if (kind === 'support11') return [OLD_FR.winger[key]].filter(Boolean)
  const value = oldForRole(kind, key)
  return value ? [value] : []
}

function maybeFromCandidates(target, lang, candidates, next) {
  if (!target || !next) return
  const current = target[lang]
  if (!current || candidates.includes(current)) target[lang] = next
}

export function applyCoachSourceFidelity(data) {
  if (!data?.formats) return data
  if (Number(data.coachSourceVersion || 0) >= COACH_SOURCE_VERSION) return data

  for (const format of ['7v7','9v9']) {
    const plan = data.formats?.[format]?.tactics?.standard
    if (!plan) continue

    for (const section of plan.global?.sections || []) {
      const source = SOURCE_GLOBAL[section.key]
      if (!source) continue
      maybe(section.text, 'fr', OLD_FR_GLOBAL[section.key], source.fr)
      maybe(section.text, 'en', OLD_EN_GLOBAL[section.key], source.en)
    }

    for (const player of plan.players || []) {
      const kind = SOURCE_MAP[format]?.[player.number]
      const source = SOURCE_ROLES[kind]
      if (!source) continue

      const oldRoleCandidates = [
        OLD_FR.goalkeeper.role, OLD_FR.stopper.role, OLD_FR.centralMid.role, OLD_FR.striker.role,
        'Arrière latéral gauche','Arrière latéral droit','Milieu défensif gauche','Milieu défensif droit',
        'Ailier gauche','Ailier droit',
      ]
      if (!player.role?.fr || oldRoleCandidates.includes(player.role.fr)) player.role.fr = source.role

      for (const section of player.sections || []) {
        if (!source[section.key]) continue
        maybeFromCandidates(section.text, 'fr', legacySectionCandidates(kind, section.key), source[section.key])
      }
    }
  }

  data.coachSourceVersion = COACH_SOURCE_VERSION
  return data
}
