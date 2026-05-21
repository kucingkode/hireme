<?php

use App\Models\Cv;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

it('lists cvs for authenticated user', function () {
    Cv::factory()->count(3)->create(['user_id' => $this->user->id]);
    Cv::factory()->count(2)->create(); // other users' cvs

    $response = $this->getJson('/api/cvs');

    $response->assertOk()
             ->assertJsonCount(3);
});

it('returns cv by id', function () {
    $cv = Cv::factory()->create(['user_id' => $this->user->id]);

    $this->getJson("/api/cvs/{$cv->id}")
         ->assertOk()
         ->assertJsonFragment(['id' => $cv->id]);
});

it('cannot access another users cv', function () {
    $cv = Cv::factory()->create(); // different user

    $this->getJson("/api/cvs/{$cv->id}")
         ->assertNotFound();
});

it('deletes cv', function () {
    $cv = Cv::factory()->create(['user_id' => $this->user->id]);

    $this->deleteJson("/api/cvs/{$cv->id}")
         ->assertNoContent();

    $this->assertDatabaseMissing('cvs', ['id' => $cv->id]);
});

