document.addEventListener("DOMContentLoaded", () => {
    // ヒーローセクションの初期アニメーション
    const heroContent = document.querySelector('.fade-in');
    if (heroContent) {
        setTimeout(() => {
            heroContent.classList.add('visible');
        }, 150);
    }

    // スクロールアニメーション（Intersection Observer）
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // 一度表示されたら監視を解除する場合は以下のコメントアウトを外す
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // アニメーション対象の要素を監視
    const animatedElements = document.querySelectorAll('.slide-up');
    animatedElements.forEach(el => observer.observe(el));
});
