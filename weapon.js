const Weapon = {
  projectiles: [],
  fireTimer: 0,

  get stats() {
    return Player.stats;
  },

  update(dt) {
    if (Enemy.list.length === 0) return;
    this.fireTimer += dt;
    if (this.fireTimer >= this.stats.attackSpeed) {
      this.fireTimer = 0;
      this.fire();
    }
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.distTraveled += Math.sqrt(p.vx * p.vx + p.vy * p.vy) * dt;
      if (p.distTraveled >= this.stats.range) {
        this.projectiles.splice(i, 1);
        continue;
      }
      let hit = false;
      for (const e of Enemy.list) {
        if (!e.alive) continue;
        const dx = p.x - e.x;
        const dy = p.y - e.y;
        const threshold = e.type === 'slime' ? 20 : 24;
        if (dx * dx + dy * dy < threshold * threshold) {
          e.hp -= this.stats.damage;
          if (e.hp <= 0) {
            e.alive = false;
            Player.kills++;
            this.spawnXpGem(e.x, e.y);
          }
          hit = true;
          break;
        }
      }
      if (hit) this.projectiles.splice(i, 1);
    }
  },

  spawnXpGem(x, y) {
    const gems = Enemy.xpGems || (Enemy.xpGems = []);
    gems.push({ x, y, value: 1, size: 6 });
  },

  fire() {
    let closest = null;
    let closestDist = Infinity;
    for (const e of Enemy.list) {
      if (!e.alive) continue;
      const dx = e.x - Player.x;
      const dy = e.y - Player.y;
      const dist = dx * dx + dy * dy;
      const rangeSq = this.stats.range * this.stats.range;
      if (dist < rangeSq && dist < closestDist) {
        closestDist = dist;
        closest = e;
      }
    }
    if (!closest) return;
    const dx = closest.x - Player.x;
    const dy = closest.y - Player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const count = this.stats.projectileCount;
    const spread = count > 1 ? 0.15 : 0;
    for (let i = 0; i < count; i++) {
      const angle = Math.atan2(dy, dx) + (i - (count - 1) / 2) * spread;
      this.projectiles.push({
        x: Player.x,
        y: Player.y,
        vx: Math.cos(angle) * 400,
        vy: Math.sin(angle) * 400,
        distTraveled: 0,
        trail: [],
      });
    }
  },

  renderAll(ctx) {
    for (const p of this.projectiles) {
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 6) p.trail.shift();
      for (let t = 0; t < p.trail.length; t++) {
        const alpha = t / p.trail.length * 0.6;
        ctx.fillStyle = `rgba(255, 220, 50, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.trail[t].x, p.trail[t].y, 2 + t * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#ffe040';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  },
};
