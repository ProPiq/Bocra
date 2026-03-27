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
                        <li><a href="#/portfolio">Portfolio</a></li>
                        <li><a href="#/price">Pricing</a></li>
                        <li class="menu-active"><a href="#/contact">Contact</a></li>
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
                            <a href="#/contact">Contact</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- Banner Section End-->

        <!-- Contact Section Start -->
        <section class="contact">
            <div class="container">
                <div class="section-header">
                    <h3 class="section-title">Contact Us</h3>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla ullamcorper pharetra ligula nec hendrerit. Ut eu libero nec magna placerat fringilla.
                    </p>
                </div>

                <div class="row contact-info">
                    <div class="col-md-4">
                        <div class="contact-address">
                            <i class="ion-md-pin"></i>
                            <h3>Address</h3>
                            <address>Plot 50671 Independence Avenue, Gaborone</address>
                        </div>
                    </div>

                    <div class="col-md-4">
                        <div class="contact-phone">
                            <i class="ion-md-call"></i>
                            <h3>Phone Number</h3>
                            <p><a href="tel:+2673957755">+267 395 7755</a></p>
                        </div>
                    </div>

                    <div class="col-md-4">
                        <div class="contact-email">
                            <i class="ion-md-mail"></i>
                            <h3>Email</h3>
                            <p><a href="mailto:info@bocra.org.bw">info@bocra.org.bw</a></p>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="map">
                            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3584.383437814712!2d25.9167839!3d-24.6549964!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1ebb5ba1128f935d%3A0xa164d400c9b368f5!2sBOCRA%20-%20Botswana%20Communications%20Regulatory%20Authority!5e0!3m2!1sen!2sbw!4v1710000000000" frameborder="0" style="border:0;" allowfullscreen=""></iframe>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form">
                            <form class="contactForm" @submit.prevent>
                                <div class="form-row">
                                    <div class="form-group col-md-6">
                                        <input type="text" class="form-control" placeholder="Your Name" />
                                    </div>
                                    <div class="form-group col-md-6">
                                        <input type="email" class="form-control" placeholder="Your Email" />
                                    </div>
                                </div>
                                <div class="form-group">
                                    <input type="text" class="form-control" placeholder="Subject" />
                                </div>
                                <div class="form-group">
                                    <textarea class="form-control" rows="5" placeholder="Message"></textarea>
                                </div>
                                <div><button type="submit">Send Message</button></div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- Contact Section End -->

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
