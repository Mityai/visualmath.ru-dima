export default function findBootstrapEnvironment() {
  if (__SERVER__) {
    return 'xs';
  }

  let width = document.querySelector('body').offsetWidth;
  if (width >= 1200) {
    return 'lg';
  }

  if (width >= 992) {
    return 'md';
  }

  if (width >= 768) {
    return 'sm';
  }

  return 'xs';
}
