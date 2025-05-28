export function isAdmin(interaction) {
  return interaction.member.permissions.has('Administrator');
}
