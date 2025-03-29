export default function Home() {
  return (
    <div className='min-h-screen bg-white dark:bg-gray-900'>
      {/* Hero Section */}
      <main className='max-w-4xl mx-auto px-4 py-20'>
        <div className='text-center mb-16'>
          <h1 className='text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text'>
            Utkarsh Chaudhary
          </h1>
          <p className='text-xl text-gray-600 dark:text-gray-300'>
            Full Stack Developer
          </p>
        </div>

        {/* About Section */}
        <section className='mb-16'>
          <h2 className='text-2xl font-bold mb-6'>About Me</h2>
          <p className='text-gray-600 dark:text-gray-300 leading-relaxed'>
            I'm a passionate developer with expertise in modern web
            technologies. I specialize in building responsive and performant
            applications using React, Next.js, and other cutting-edge tools.
          </p>
        </section>

        {/* Skills Section */}
        <section className='mb-16'>
          <h2 className='text-2xl font-bold mb-6'>Skills</h2>
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
            {[
              "Next.js",
              "React",
              "TypeScript",
              "Node.js",
              "Tailwind CSS",
              "MongoDB",
            ].map((skill) => (
              <div
                key={skill}
                className='bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center'
              >
                {skill}
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className='text-center'>
          <h2 className='text-2xl font-bold mb-6'>Get In Touch</h2>
          <div className='flex justify-center gap-6'>
            <a
              href='https://github.com/yourusername'
              target='_blank'
              rel='noopener noreferrer'
              className='text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
            >
              GitHub
            </a>
            <a
              href='https://linkedin.com/in/yourusername'
              target='_blank'
              rel='noopener noreferrer'
              className='text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
            >
              LinkedIn
            </a>
            <a
              href='mailto:your.email@example.com'
              className='text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
            >
              Email
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
