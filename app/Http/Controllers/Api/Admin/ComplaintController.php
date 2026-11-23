<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ComplaintController extends Controller
{
    public function update(Request $request, Complaint $complaint): JsonResponse
    {
        $d = $request->validate([
            'status' => ['sometimes', Rule::in(['Baru', 'Diproses', 'Selesai'])],
            'reply'  => 'sometimes|nullable|string|max:3000',
            'faq'    => 'sometimes|boolean', // tampilkan di Bantuan & FAQ (jawaban cepat)
        ]);

        $complaint->fill(Arr::only($d, ['status', 'reply']));
        if (array_key_exists('faq', $d)) {
            $complaint->show_faq = (bool) $d['faq'];
        }

        // Pertanyaan tanpa jawaban tidak boleh tampil di FAQ
        if ($complaint->show_faq && trim((string) $complaint->reply) === '') {
            throw ValidationException::withMessages(['faq' => 'Isi balasan dulu (tombol Balas) sebelum ditampilkan di FAQ.']);
        }

        $complaint->save();

        return response()->json($complaint->toFront());
    }

    public function destroy(Complaint $complaint): JsonResponse
    {
        $complaint->delete();

        return response()->json(['ok' => true]);
    }
}
