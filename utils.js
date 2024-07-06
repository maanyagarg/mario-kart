// images loading
export function createImage(link) {
  var image = new Image();
  image.src = link;
  return image;
}

export function detectCollisionOnPlatform(object, platform) {
  if (
    object.position.y + object.height <= platform.position.y &&
    object.position.y + object.velocity.y + object.height >=
      platform.position.y &&
    object.position.x + object.width > platform.position.x &&
    object.position.x < platform.position.x + platform.width
  )
    return true;
  else return false;
}

export function detectCollisionOnObject(object1, object2) {
  if (
    object1.position.y + object1.height <= object2.position.y &&
    object1.position.y + object1.velocity.y + object1.height >=
      object2.position.y &&
    object1.position.x + object1.width > object2.position.x &&
    object1.position.x < object2.position.x + object2.width
  )
    return true;
  else return false;
}

export function detectCollisionOfCircle(object, platform) {
  if (
    object.position.y + object.radius <= platform.position.y &&
    object.position.y + object.velocity.y + object.radius >=
      platform.position.y &&
    object.position.x + object.radius > platform.position.x &&
    object.position.x < platform.position.x + platform.width
  )
    return true;
  else return false;
}

export function hitGoomba(player, goomba) {
  if (
    player.position.x + player.width >= goomba.position.x &&
    player.position.x <= goomba.position.x + goomba.width &&
    player.position.y + player.height >= goomba.position.y &&
    player.position.y <= goomba.position.y + goomba.height
  )
    return true;
  else return false;
}

export function hitsBottomOfBlock(player, platform) {
  return (
    player.position.y <= platform.position.y + platform.height &&
    player.position.y - player.velocity.y >=
      platform.position.y + platform.height &&
    player.position.x + player.width >= platform.position.x &&
    player.position.x <= platform.position.x + platform.width
  );
}

export function hitsSideOfBlock(player, platform) {
  return (
    player.position.x +
      player.width +
      player.velocity.x -
      platform.velocity.x >=
      platform.position.x &&
    player.position.x + player.velocity.x <=
      platform.position.x + platform.width &&
    player.position.y <= platform.position.y + platform.height &&
    player.position.y + player.height >= platform.position.y
  );
}

export function passingThroughFlower(player, fireFlower) {
  return (
    player.position.x + player.width >= fireFlower.position.x &&
    player.position.x <= fireFlower.position.x + fireFlower.width &&
    player.position.y + player.height >= fireFlower.position.y &&
    player.position.y <= fireFlower.position.y + fireFlower.height
  );
}
