<template>
<!-- Header Section Start -->
        <header class="header">
            <div class="container-fluid">
                <div class="logo pull-left">
                    <a href="#/" class="logo-link" aria-label="BOCRA home">
                        <img src="/img/logo-transparent.png" alt="BOCRA" />
                    </a>
                </div>

                <nav id="nav-menu-container">
                    <ul class="nav-menu">
                        <li><a href="#/">Home</a></li>
                        <li><a href="#/about">About</a></li>
                        <li><a href="#/service">Services</a></li>
                        <li class="menu-active"><a href="#/portfolio">Portfolio</a></li>
                        <li><a href="#/price">Pricing</a></li>
                        <li><a href="#/contact">Contact</a></li>
                        <li class="login-btn"><a href="#/login">Login</a></li>
                    </ul>
                </nav>
            </div>
        </header>
        <!-- Header Section End -->
        
        <!-- Banner Section Start-->
        <section class="banner">
            <div class="container">
                <div class="col-lg-12">
                    <div class="banner-nav">
                        <div class="banner-box">
                            <a href="#/">Home </a>
                            <a href="#/portfolio">Portfolio</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- Banner Section End-->

        <!-- Portfolio Section Start -->
        <section class="portfolio">
            <div class="container">

                <header class="section-header">
                    <h3 class="section-title">Our Portfolio</h3>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla ullamcorper pharetra ligula nec hendrerit. Ut eu libero nec magna placerat fringilla.
                    </p>
                </header>

                <div class="row">
                    <div class="col-lg-12">
                        <ul id="portfolio-flters">
                            <li data-filter="*" class="filter-active">All</li>
                            <li data-filter=".web-des">Web Design</li>
                            <li data-filter=".web-dev">Web Development</li>
                            <li data-filter=".app-des">App Design</li>
                            <li data-filter=".app-dev">App Development</li>
                        </ul>
                    </div>
                </div>

                <div class="row portfolio-container">
                    <div class="col-lg-4 col-md-6 portfolio-item web-des">
                        <div class="portfolio-wrap">
                            <figure>
                                <img src="/img/portfolio-1.jpg" class="img-fluid" alt="Portfolio">
                                <a href="/img/portfolio-1.jpg" data-lightbox="portfolio" data-title="Lorem ipsum dolor" class="link-preview" title="Preview"><i class="ion-md-eye"></i></a>
                                <a href="#/portfolio" class="link-details" title="More Details"><i class="ion-md-open"></i></a>
                            </figure>

                            <div class="portfolio-info">
                                <h4>Lorem ipsum dolor</h4>
                                <p>Web Design</p>
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-4 col-md-6 portfolio-item web-dev">
                        <div class="portfolio-wrap">
                            <figure>
                                <img src="/img/portfolio-2.jpg" class="img-fluid" alt="Portfolio">
                                <a href="/img/portfolio-2.jpg" class="link-preview" data-lightbox="portfolio" data-title="Nulla ullamcorper pharetra" title="Preview"><i class="ion-md-eye"></i></a>
                                <a href="#/portfolio" class="link-details" title="More Details"><i class="ion-md-open"></i></a>
                            </figure>

                            <div class="portfolio-info">
                                <h4>Nulla ullamcorper pharetra</h4>
                                <p>Web Development</p>
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-4 col-md-6 portfolio-item app-des">
                        <div class="portfolio-wrap">
                            <figure>
                                <img src="/img/portfolio-3.jpg" class="img-fluid" alt="Portfolio">
                                <a href="/img/portfolio-3.jpg" class="link-preview" data-lightbox="portfolio" data-title="Phasellus eget dictum" title="Preview"><i class="ion-md-eye"></i></a>
                                <a href="#/portfolio" class="link-details" title="More Details"><i class="ion-md-open"></i></a>
                            </figure>

                            <div class="portfolio-info">
                                <h4>Phasellus eget dictum</h4>
                                <p>App Design</p>
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-4 col-md-6 portfolio-item app-dev">
                        <div class="portfolio-wrap">
                            <figure>
                                <img src="/img/portfolio-4.jpg" class="img-fluid" alt="Portfolio">
                                <a href="/img/portfolio-4.jpg" data-lightbox="portfolio" data-title="Lorem ipsum dolor" class="link-preview" title="Preview"><i class="ion-md-eye"></i></a>
                                <a href="#/portfolio" class="link-details" title="More Details"><i class="ion-md-open"></i></a>
                            </figure>

                            <div class="portfolio-info">
                                <h4>Donec mattis vestibulum</h4>
                                <p>App Development</p>
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-4 col-md-6 portfolio-item web-des">
                        <div class="portfolio-wrap">
                            <figure>
                                <img src="/img/portfolio-5.jpg" class="img-fluid" alt="Portfolio">
                                <a href="/img/portfolio-5.jpg" class="link-preview" data-lightbox="portfolio" data-title="Nulla ullamcorper pharetra" title="Preview"><i class="ion-md-eye"></i></a>
                                <a href="#/portfolio" class="link-details" title="More Details"><i class="ion-md-open"></i></a>
                            </figure>

                            <div class="portfolio-info">
                                <h4>Pellentesque ullamcorper</h4>
                                <p>Web Design</p>
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-4 col-md-6 portfolio-item web-dev">
                        <div class="portfolio-wrap">
                            <figure>
                                <img src="/img/portfolio-6.jpg" class="img-fluid" alt="Portfolio">
                                <a href="/img/portfolio-6.jpg" class="link-preview" data-lightbox="portfolio" data-title="Phasellus eget dictum" title="Preview"><i class="ion-md-eye"></i></a>
                                <a href="#/portfolio" class="link-details" title="More Details"><i class="ion-md-open"></i></a>
                            </figure>

                            <div class="portfolio-info">
                                <h4>Sed pretium sapien</h4>
                                <p>Web Development</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
        <!-- Portfolio Section End -->

        <!-- Footer Start -->
        <footer class="footer">
            <div class="footer-top">
                <div class="container">
                    <div class="row">
                        <div class="col-lg-3 col-md-6 footer-info">
                            <h3>BOCRA</h3>
                            <p>
                                Botswana Communications Regulatory Authority regulates the communications sector in
                                Botswana and supports safe, competitive, and inclusive digital growth.
                            </p>
                        </div>

                        <div class="col-lg-3 col-md-6 footer-links">
                            <h4>Quick Links</h4>
                            <ul>
                                <li><i class="ion-md-arrow-dropright"></i> <a href="#/">Home</a></li>
                                <li><i class="ion-md-arrow-dropright"></i> <a href="#/about">About</a></li>
                                <li><i class="ion-md-arrow-dropright"></i> <a href="#/service">Services</a></li>
                                <li><i class="ion-md-arrow-dropright"></i> <a href="#/contact">Contact</a></li>
                                <li><i class="ion-md-arrow-dropright"></i> <a href="#/login">Portal Login</a></li>
                            </ul>
                        </div>

                        <div class="col-lg-3 col-md-6 footer-contact">
                            <h4>Contact Us</h4>
                            <p>
                                Plot 50671<br>
                                Independence Avenue, Gaborone<br>
                                Botswana<br>
                                <strong>Phone:</strong> +267 395 7755<br>
                                <strong>Email:</strong> info@bocra.org.bw<br>
                            </p>

                            <div class="social-links">
                                <a href="https://x.com/bocrabw"><i class="ion-logo-twitter"></i></a>
                                <a href="https://www.facebook.com/BTAbw"><i class="ion-logo-facebook"></i></a>
                                <a href="https://www.youtube.com/channel/UCkv70wCxbxy7OkC12QlL3ZA/feed"><i class="ion-logo-youtube"></i></a>
                                <a href="https://www.linkedin.com/company/bta_3/"><i class="ion-logo-linkedin"></i></a>
                                <a href="https://www.flickr.com/photos/bocra_bw/"><i class="ion-logo-flickr"></i></a>
                            </div>

                        </div>

                        <div class="col-lg-3 col-md-6 footer-newsletter">
                            <h4>Stay Updated</h4>
                            <p>Subscribe for BOCRA public notices, regulatory updates, and service announcements.</p>
                            <form action="" method="post">
                                <input type="email" name="email"><input type="submit"  value="Subscribe">
                            </form>
                        </div>

                    </div>
                </div>
            </div>

            <div class="container">
                <div class="copyright">
                    &copy; Copyright <a href="#/">BOCRA</a>. All Rights Reserved
                </div>
            </div>
        </footer>
        <!-- Footer End -->

        <a href="#" class="back-to-top"><i class="ion-md-arrow-dropup"></i></a>

        <!-- Vendor JS Files -->
</template>
