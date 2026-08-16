/**
 * Trust Score (0–100) is a weighted blend of four signals:
 * - Completion rate (40%): completed vs total non-pending bookings
 * - Avg rating (30%): scaled from 1-5 to 0-100
 * - Response speed (15%): faster average response = higher score
 * - Repeat customers (15%): rewards providers customers come back to
 */
function calculateTrustScore(user) {
    const totalDecided = user.completeBookings + user.cancelBookings;

    // Completion rate — default to neutral 70 if no history yet
    const completionRate = totalDecided > 0
        ? (user.completeBookings / totalDecided) * 100
        : 70;

    // Average rating scaled to 0-100
    const avgRating = user.ratingCount > 0
        ? (user.ratingSum / user.ratingCount) / 5 * 100
        : 70;

    // Response speed — under 10 mins avg = 100, over 120 mins = 0, linear between
    const avgResponseMins = user.responseCount > 0
        ? user.totalResponseTimeMins / user.responseCount
        : 30;
    const responseScore = Math.max(0, Math.min(100, 100 - ((avgResponseMins - 10) / (120 - 10)) * 100));

    // Repeat customer rate — capped contribution, since this needs volume to be meaningful
    const repeatScore = Math.min(100, (user.repeatCustomers / Math.max(1, user.completeBookings)) * 100);

    const trustScore =
        completionRate * 0.4 +
        avgRating * 0.3 +
        responseScore * 0.15 +
        repeatScore * 0.15;

    return Math.round(trustScore);
}

module.exports = calculateTrustScore;