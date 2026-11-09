import { useUI } from '../components/ui/UIContext'
import CodingChallengeCard from '../components/coding-technology/CodingChallengeCard'
import CodingContinueCard from '../components/coding-technology/CodingContinueCard'
import CodingHeroBanner from '../components/coding-technology/CodingHeroBanner'
import CodingProgressPanel from '../components/coding-technology/CodingProgressPanel'
import CodingRecommendationCard from '../components/coding-technology/CodingRecommendationCard'
import TechSkillCard from '../components/coding-technology/TechSkillCard'
import { TECH_SKILLS } from '../data/codingTechnologyContent'

export default function CodingTechnologyPage() {
  const { notify } = useUI()

  return (
    <div className="coding">
      <CodingHeroBanner />
      <CodingContinueCard />

      <section className="coding__skills">
        <div className="coding__section-head">
          <div>
            <h2 className="coding__section-title">Explore Technology Skills</h2>
            <p className="coding__section-sub">
              Choose a learning path and build your digital skills step by step.
            </p>
          </div>
          <button
            type="button"
            className="coding__section-link"
            onClick={() => notify('Showing all technology skills', 'success')}
          >
            View All
          </button>
        </div>

        <div className="coding__skills-grid">
          {TECH_SKILLS.map((skill) => (
            <TechSkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      </section>

      <div className="coding__bottom">
        <CodingRecommendationCard />
        <CodingChallengeCard />
        <CodingProgressPanel />
      </div>
    </div>
  )
}
