/**
 * Central image manifest.
 *
 * Every raster asset used by the application is referenced from here so that
 * photography / illustration can be swapped in one place without touching the
 * components. Drop a replacement file into `public/assets/` (or
 * `src/assets/`) and update the matching key below.
 */
import practiceHero from '../assets/practice/hero-illustration.png'
import practicePageIcon from '../assets/practice/page-icon.png'
import practiceKitoTip from '../assets/practice/kito-tip.png'
import practicePieChart from '../assets/practice/pie-chart.png'
import practiceDifficultyEasy from '../assets/practice/difficulty-easy.png'
import practiceDifficultyMedium from '../assets/practice/difficulty-medium.png'
import practiceDifficultyChallenge from '../assets/practice/difficulty-challenge.png'
import subjectBadgeMathematics from '../assets/subjects/badge-mathematics.png'
import subjectBadgeEnglish from '../assets/subjects/badge-english.png'
import subjectBadgeKiswahili from '../assets/subjects/badge-kiswahili.png'
import subjectBadgeScience from '../assets/subjects/badge-science.png'
import subjectBadgeSocial from '../assets/subjects/badge-social.png'
import subjectBadgeAgriculture from '../assets/subjects/badge-agriculture.png'
import subjectBadgeArts from '../assets/subjects/badge-arts.png'
import subjectBadgeReligious from '../assets/subjects/badge-religious.png'
import subjectIllustrationMathematics from '../assets/subjects/illustration-mathematics.png'
import subjectIllustrationEnglish from '../assets/subjects/illustration-english.png'
import subjectIllustrationKiswahili from '../assets/subjects/illustration-kiswahili.png'
import subjectIllustrationScience from '../assets/subjects/illustration-science.png'
import subjectIllustrationSocial from '../assets/subjects/illustration-social.png'
import subjectIllustrationAgriculture from '../assets/subjects/illustration-agriculture.png'
import subjectIllustrationArts from '../assets/subjects/illustration-arts.png'
import subjectIllustrationReligious from '../assets/subjects/illustration-religious.png'
import subjectKitoHelper from '../assets/subjects/kito-helper.png'
import mathStrandNumbers from '../assets/mathematics/strand-numbers.png'
import mathStrandFractions from '../assets/mathematics/strand-fractions.png'
import mathStrandGeometry from '../assets/mathematics/strand-geometry.png'
import mathStrandMeasurement from '../assets/mathematics/strand-measurement.png'
import mathIllustrationNumbers from '../assets/mathematics/illustration-numbers.png'
import mathIllustrationFractions from '../assets/mathematics/illustration-fractions.png'
import mathIllustrationGeometry from '../assets/mathematics/illustration-geometry.png'
import mathIllustrationMeasurement from '../assets/mathematics/illustration-measurement.png'
import mathKitoRecommend from '../assets/mathematics/kito-recommend.png'
import codingHero from '../assets/coding-technology/hero-illustration.png'
import codingContinueArt from '../assets/coding-technology/continue-illustration.png'
import codingCodeEditor from '../assets/coding-technology/code-editor.png'
import codingSkillComputerBasics from '../assets/coding-technology/skill-computer-basics.png'
import codingSkillDigitalSkills from '../assets/coding-technology/skill-digital-skills.png'
import codingSkillCodingFundamentals from '../assets/coding-technology/skill-coding-fundamentals.png'
import codingSkillInternetSafety from '../assets/coding-technology/skill-internet-safety.png'
import codingSkillBuildWithCode from '../assets/coding-technology/skill-build-with-code.png'
import codingSkillRobotics from '../assets/coding-technology/skill-robotics.png'
import codingKitoRobot from '../assets/coding-technology/kito-robot.png'
import codingChallengeBoard from '../assets/coding-technology/challenge-board.png'
import codingAchievementMedal from '../assets/coding-technology/achievement-medal.png'
import bibleHero from '../assets/bible-learning/hero-illustration.png'
import bibleDavidGoliath from '../assets/bible-learning/david-illustration.png'
import bibleVerseBook from '../assets/bible-learning/verse-book.png'
import bibleEsther from '../assets/bible-learning/esther-illustration.png'
import bibleKindness from '../assets/bible-learning/kindness-illustration.png'
import bibleKito from '../assets/bible-learning/kito-robot.png'
import bibleSkillStories from '../assets/bible-learning/skill-bible-stories.png'
import bibleSkillMemory from '../assets/bible-learning/skill-memory-verses.png'
import bibleSkillCharacter from '../assets/bible-learning/skill-christian-character.png'
import bibleSkillLife from '../assets/bible-learning/skill-life-lessons.png'
import bibleSkillPrayer from '../assets/bible-learning/skill-prayer-reflection.png'
import bibleSkillPeople from '../assets/bible-learning/skill-people-of-bible.png'
import bibleBadgeDavidGoliath from '../assets/bible-learning/badge-david-goliath.png'
import bibleBadgeStories from '../assets/bible-learning/badge-stories.png'
import bibleBadgeMemory from '../assets/bible-learning/badge-memory.png'
import bibleBadgeCharacter from '../assets/bible-learning/badge-character.png'
import bibleBadgeLife from '../assets/bible-learning/badge-life.png'
import bibleBadgePrayer from '../assets/bible-learning/badge-prayer.png'
import bibleBadgePeople from '../assets/bible-learning/badge-people.png'

export const IMAGES = {
  /** Sidebar brand mark (Kito robot head). */
  brandLogo: '/assets/logo-robot.png',
  /** Learner avatar used in the header. */
  avatar: '/assets/girl-hero.png',
  /** Graduation cap shown on the "Grade 6" chip. */
  gradeCap: '/assets/ic-cap.png',
  /** Hero artwork for the "Continue learning" banner. */
  continueLearning: '/assets/girl-hero.png',
  /** Flame badge used by the streak card. */
  streakFlame: '/assets/flame-ring.png',
  /** Kito robot mascot (small, streak card). */
  kitoStreak: '/assets/kito-streak.png',
  /** Kito robot mascot (large, sidebar chat card). */
  kitoSidebar: '/assets/kito-sidebar.png',
  /** Kito robot mascot (keep improving card). */
  kitoImprove: '/assets/kito-improve.png',
  /** Lesson illustrations. */
  lessonMathematics: '/assets/illus-math.png',
  lessonScience: '/assets/illus-science.png',
  lessonCoding: '/assets/illus-coding.png',
  lessonBible: '/assets/illus-bible.png',
  /** Achievement badges. */
  badgeStreak: '/assets/badge-streak.png',
  badgeMath: '/assets/badge-math.png',
  badgeCode: '/assets/badge-code.png',
  badgeReading: '/assets/badge-reading.png',

  /* ----------------------------- practice page ----------------------------- */
  /** Two children writing, with the pie chart and 1/2/3 step badges. */
  practiceHero,
  /** Blue rounded-square “pencil” app icon. */
  practicePageIcon,
  /** Kito the robot waving, used in the tip card. */
  practiceKitoTip,
  /** Blue pie chart beside the 3/4 fraction. */
  practicePieChart,
  /** Difficulty characters. */
  difficultyEasy: practiceDifficultyEasy,
  difficultyMedium: practiceDifficultyMedium,
  difficultyChallenge: practiceDifficultyChallenge,

  /* --------------------------- choose subjects page --------------------------- */
  /** Rounded-square subject badges. */
  subjectBadgeMathematics,
  subjectBadgeEnglish,
  subjectBadgeKiswahili,
  subjectBadgeScience,
  subjectBadgeSocial,
  subjectBadgeAgriculture,
  subjectBadgeArts,
  subjectBadgeReligious,
  /** Subject illustrations. */
  subjectIllustrationMathematics,
  subjectIllustrationEnglish,
  subjectIllustrationKiswahili,
  subjectIllustrationScience,
  subjectIllustrationSocial,
  subjectIllustrationAgriculture,
  subjectIllustrationArts,
  subjectIllustrationReligious,
  /** Kito the robot, used in the “Need help choosing?” band. */
  subjectKitoHelper,

  /* -------------------------- mathematics subject page -------------------------- */
  /** Strand badges (coloured circles). */
  mathStrandNumbers,
  mathStrandFractions,
  mathStrandGeometry,
  mathStrandMeasurement,
  /** Strand illustrations. */
  mathIllustrationNumbers,
  mathIllustrationFractions,
  mathIllustrationGeometry,
  mathIllustrationMeasurement,
  /** Kito the robot, used in the recommendation band. */
  mathKitoRecommend,

  /* ------------------------ coding & technology page ------------------------ */
  /** Hero illustration — child with a laptop and floating code stickers. */
  codingHero,
  /** “Continue Learning” illustration — child with a laptop and code decorations. */
  codingContinueArt,
  /** The dark code-editor card. */
  codingCodeEditor,
  /** Technology skill illustrations. */
  codingSkillComputerBasics,
  codingSkillDigitalSkills,
  codingSkillCodingFundamentals,
  codingSkillInternetSafety,
  codingSkillBuildWithCode,
  codingSkillRobotics,
  /** Kito the robot for the recommended lesson. */
  codingKitoRobot,
  /** The coding-challenge puzzle board. */
  codingChallengeBoard,
  /** The achievement medal. */
  codingAchievementMedal,

  /* --------------------------- bible learning page --------------------------- */
  /** Hero artwork — child reading the Bible. */
  bibleHero,
  /** David and Goliath illustration — “Continue Learning” card. */
  bibleDavidGoliath,
  /** Open Bible icon for “Verse of the Day”. */
  bibleVerseBook,
  /** Esther illustration — recommended lesson card. */
  bibleEsther,
  /** Kindness illustration — “Put It Into Practice” card. */
  bibleKindness,
  /** Kito the robot for the recommended lesson. */
  bibleKito,
  /** David and Goliath badge — “Continue Learning” card. */
  bibleBadgeDavidGoliath,
  /** Skill badges. */
  bibleBadgeStories,
  bibleBadgeMemory,
  bibleBadgeCharacter,
  bibleBadgeLife,
  bibleBadgePrayer,
  bibleBadgePeople,
  /** Skill illustrations. */
  bibleSkillStories,
  bibleSkillMemory,
  bibleSkillCharacter,
  bibleSkillLife,
  bibleSkillPrayer,
  bibleSkillPeople,
} as const

export type ImageKey = keyof typeof IMAGES
