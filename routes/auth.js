import { Router } from 'express';
import passport from 'passport';

const router = Router();

router.get("/login/success", (req, res) => {
	if (req.user) {
		res.status(200).json({
			error: false,
			message: "Successfully Logged In",
			user: req.user,
		});
	} else {
		res.status(403).json({ error: true, message: "Not Authorized" });
	}
});

router.get("/login/failed", (req, res) => {
	res.status(401).json({
		error: true,
		message: "Log in failure",
	});
});

router.get("/google", passport.authenticate("google", ["profile", "email"]));

router.get(
	"/google/callback",
	passport.authenticate("google", {
		successRedirect: "http://localhost:3000/get",
		failureRedirect: "http://localhost:3000/login",
	})
);

router.get("/logout", (req, res) => {
	req.logout();
	res.redirect("http://localhost:3000/login");
});

export { router, passport };
