import '../styles/profile.css'

export default function ProfileCard({ profile, children }) {
  const name = profile.display_name || profile.username
  const joined = profile.created
    ? new Date(profile.created).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : ''

  return (
    <article className="profile glass">
      <div className="profile-banner">
        {profile.banner && !profile.restricted && (
          <img
            src={profile.banner}
            alt=""
            onError={(e) => {
              e.currentTarget.hidden = true
            }}
          />
        )}
      </div>
      <div className="profile-body">
        <img className="profile-pfp" src={profile.pfp} alt={`${name}'s profile picture`} width="96" height="96" />
        <div className="profile-names">
          <h2>{name}</h2>
          <p className="profile-handle">
            @{profile.username}
            {profile.pronouns && <span className="profile-pronouns">{profile.pronouns}</span>}
          </p>
        </div>

        {profile.restricted ? (
          <p className="profile-bio">This profile is private.</p>
        ) : (
          <>
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
            <dl className="profile-stats">
              <div>
                <dt>Followers</dt>
                <dd>{profile.followers}</dd>
              </div>
              <div>
                <dt>Following</dt>
                <dd>{profile.following}</dd>
              </div>
              {joined && (
                <div>
                  <dt>Joined</dt>
                  <dd>{joined}</dd>
                </div>
              )}
            </dl>
            {profile.badges && profile.badges.length > 0 && (
              <ul className="profile-badges" aria-label="Badges">
                {profile.badges.map((b) => (
                  <li key={b.id || b.name} title={b.description}>{b.name}</li>
                ))}
              </ul>
            )}
          </>
        )}

        <div className="profile-actions">
          <a className="btn-glass" href={`https://rotur.dev/@${profile.username}`} target="_blank" rel="noreferrer">
            Open on rotur.dev
          </a>
          {children}
        </div>
      </div>
    </article>
  )
}
