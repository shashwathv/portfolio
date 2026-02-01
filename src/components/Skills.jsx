export default function Skills() {
  const categories = [
    {
      name: 'Languages',
                    skills: [
                        { name: 'Golang', primary: true },
                        { name: 'Python', primary: true },
                        { name: 'JavaScript', primary: false },
                        { name: 'TypeScript', primary: false },
                        { name: 'C', primary: false }
                        //{ name: 'Rust', primary: false }
                    ]
                },
                {
                    name: 'Backend & APIs',
                    skills: [
                        { name: 'Gin/Echo', primary: false },
                        { name: 'Flask', primary: false },
                        //{ name: 'gRPC', primary: false },
                        { name: 'REST', primary: false }
                    ]
                },
                {
                    name: 'Data & Storage',
                    skills: [
                        { name: 'PostgreSQL', primary: false },
                        { name: 'MySQL', primary: false },
                        { name: 'MariaDB', primary: false },
                        { name: 'SQLite', primary: false }
                    ]
                },
                {
                    name: 'Infrastructure',
                    skills: [
                        { name: 'Docker', primary: false },
                        //{ name: 'Kubernetes', primary: false },
                        //{ name: 'AWS/GCP', primary: false },
                        { name: 'Linux', primary: true },
                        //{ name: 'CI/CD', primary: false }
                    ]
                },
                {
                    name: 'Specializations',
                    skills: [
                        { name: 'Distributed Systems', primary: false },
                        { name: 'System Architecture', primary: false },
                        { name: 'AI Integration', primary: true },
                        { name: 'API Design', primary: true}
                    ]
                }
            ];

  return (
                <section id="skills">
                    <div className="container">
                        <div style={{ width: '100%' }}>
                            <h2 className="serif">Skills & Tools</h2>
                            <div className="skills-grid">
                                {categories.map((category, index) => (
                                    <div key={index} className="skill-category">
                                        <h3 className="text-muted">{category.name}</h3>
                                        <ul className="skill-list">
  {category.skills.map((skill, i) => (
    <li
      key={i}
      className={`${
        skill.primary ? 'skill-primary text-strong' : 'text-muted'
      }`}
    >
      {skill.name}
    </li>
  ))}
</ul>

                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            );
}
