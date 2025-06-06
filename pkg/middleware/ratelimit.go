package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

var (
	requests       = make(map[string]time.Time)
	mu             sync.Mutex
	cleanupStarted = false
)

// startCleanup starts a goroutine that periodically cleans up old entries
func startCleanup(duration time.Duration) {
	mu.Lock()
	if cleanupStarted {
		mu.Unlock()
		return
	}
	cleanupStarted = true
	mu.Unlock()

	go func() {
		ticker := time.NewTicker(duration)
		defer ticker.Stop()

		for range ticker.C {
			mu.Lock()
			now := time.Now()
			for ip, lastRequest := range requests {
				if now.Sub(lastRequest) > duration {
					delete(requests, ip)
				}
			}
			mu.Unlock()
		}
	}()
}

// RateLimit returns a middleware that limits requests to 1 per `duration` per IP
func RateLimit(duration time.Duration) gin.HandlerFunc {
	// Start cleanup goroutine once
	startCleanup(duration)

	return func(c *gin.Context) {
		ip := c.ClientIP()

		mu.Lock()
		lastRequest, exists := requests[ip]
		if exists && time.Since(lastRequest) < duration {
			mu.Unlock()
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Too many requests. Please try again later.",
			})
			c.Abort()
			return
		}
		requests[ip] = time.Now()
		mu.Unlock()

		c.Next()
	}
}
