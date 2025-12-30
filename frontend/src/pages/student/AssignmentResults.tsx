import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { assignmentsService, type AssignmentWithAnswersOut } from '@/services/api/assignments.service';

const AssignmentResults: React.FC = () => {
    const { studentAssignmentId } = useParams<{ studentAssignmentId: string }>();
    const [data, setData] = useState<AssignmentWithAnswersOut | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!studentAssignmentId) return;

            setIsLoading(true);
            setError(null);

            try {
                const result = await assignmentsService.getAssignmentDetails(Number(studentAssignmentId));
                setData(result);
            } catch (e: any) {
                setError(e?.response?.data?.detail ?? e?.message ?? 'Failed to load results');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [studentAssignmentId]);

    if (isLoading) {
        return (
            <div className="container">
                <p>Loading...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="container">
                <Link to="/student/assignments" style={{ marginBottom: '20px', display: 'inline-block' }}>
                    ← Back to Assignments
                </Link>
                <div className="card" style={{ borderLeft: '4px solid #e74c3c' }}>
                    <strong>Error:</strong> {error || 'Results not found'}
                </div>
            </div>
        );
    }

    const isText = data.assignment.contentType === 'TEXT';
    const answerMap = new Map(data.studentAnswers.map(a => [a.questionId, a]));

    return (
        <div className="container">
            <Link to="/student/assignments" style={{ marginBottom: '20px', display: 'inline-block' }}>
                ← Back to Assignments
            </Link>

            <h1 className="page-title">{data.assignment.title} - Results</h1>

            <div className="card">
                <div style={{ marginBottom: '20px', padding: '20px', background: '#d4edda', borderRadius: '8px', border: '2px solid #28a745' }}>
                    <h2 style={{ marginTop: 0, color: '#155724' }}>✅ Assignment Completed</h2>
                    <p style={{ margin: '5px 0' }}>
                        <strong>Type:</strong> {isText ? '📄 TEXT' : '📝 TEST'}
                    </p>
                    {data.totalScore !== null && data.totalScore !== undefined && (
                        <p style={{ margin: '5px 0', fontSize: '1.3rem' }}>
                            <strong>Your Score:</strong> <span style={{ color: '#27ae60', fontSize: '1.5rem' }}>{data.totalScore}/100</span>
                        </p>
                    )}
                </div>

                {isText ? (
                    <>
                        <h2>Content</h2>
                        <div style={{
                            background: 'white',
                            padding: '20px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            whiteSpace: 'pre-wrap',
                            lineHeight: '1.6',
                            fontFamily: 'Georgia, serif',
                            fontSize: '1.05rem'
                        }}>
                            {data.assignment.contentText}
                        </div>
                    </>
                ) : (
                    <>
                        <h2>Test Review</h2>
                        <p style={{ color: '#666', marginBottom: '20px' }}>
                            Review your answers and see the correct answers below.
                        </p>

                        {data.questions.map((q, idx) => {
                            const studentAnswer = answerMap.get(q.questionId);
                            const isCorrect = studentAnswer?.isCorrect ?? false;

                            return (
                                <div
                                    key={q.questionId}
                                    style={{
                                        border: `3px solid ${isCorrect ? '#28a745' : '#e74c3c'}`,
                                        borderRadius: '8px',
                                        padding: '20px',
                                        marginBottom: '20px',
                                        background: isCorrect ? '#d4edda' : '#f8d7da'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                                        <h3 style={{ marginTop: 0 }}>
                                            Question {idx + 1} ({q.points} points)
                                        </h3>
                                        <div style={{
                                            padding: '5px 15px',
                                            borderRadius: '20px',
                                            background: isCorrect ? '#28a745' : '#e74c3c',
                                            color: 'white',
                                            fontWeight: 'bold'
                                        }}>
                                            {isCorrect ? `✓ +${studentAnswer?.pointsEarned ?? 0}` : '✗ 0'}
                                        </div>
                                    </div>

                                    <p style={{ fontSize: '1.1rem', marginBottom: '15px', fontWeight: '500' }}>{q.questionText}</p>

                                    {q.questionType === 'TRUE_FALSE' ? (
                                        <div style={{ marginTop: '15px' }}>
                                            <p style={{ margin: '5px 0' }}>
                                                <strong>Your Answer:</strong>{' '}
                                                <span style={{
                                                    padding: '3px 10px',
                                                    borderRadius: '4px',
                                                    background: isCorrect ? '#28a745' : '#e74c3c',
                                                    color: 'white'
                                                }}>
                                                    {studentAnswer?.answer === 'true' ? 'True' : 'False'}
                                                </span>
                                            </p>
                                            {!isCorrect && (
                                                <p style={{ margin: '5px 0' }}>
                                                    <strong>Correct Answer:</strong>{' '}
                                                    <span style={{
                                                        padding: '3px 10px',
                                                        borderRadius: '4px',
                                                        background: '#28a745',
                                                        color: 'white'
                                                    }}>
                                                        {q.correctAnswer === 'true' ? 'True' : 'False'}
                                                    </span>
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div style={{ marginTop: '15px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {q.options.map((opt) => {
                                                    const isStudentChoice = studentAnswer?.answer === opt.optionLetter;
                                                    const isCorrectChoice = q.correctAnswer === opt.optionLetter;

                                                    return (
                                                        <div
                                                            key={opt.optionLetter}
                                                            style={{
                                                                padding: '10px',
                                                                borderRadius: '6px',
                                                                background: isCorrectChoice ? '#d4edda' : (isStudentChoice ? '#f8d7da' : 'white'),
                                                                border: `2px solid ${isCorrectChoice ? '#28a745' : (isStudentChoice ? '#e74c3c' : '#ddd')}`,
                                                            }}
                                                        >
                                                            <span style={{ fontSize: '1.05rem' }}>
                                                                <strong>{opt.optionLetter.toUpperCase()})</strong> {opt.optionText}
                                                                {isStudentChoice && !isCorrectChoice && (
                                                                    <span style={{ marginLeft: '10px', color: '#e74c3c', fontWeight: 'bold' }}>← Your Answer ✗</span>
                                                                )}
                                                                {isStudentChoice && isCorrectChoice && (
                                                                    <span style={{ marginLeft: '10px', color: '#28a745', fontWeight: 'bold' }}>← Your Answer ✓</span>
                                                                )}
                                                                {!isStudentChoice && isCorrectChoice && (
                                                                    <span style={{ marginLeft: '10px', color: '#28a745', fontWeight: 'bold' }}>← Correct Answer</span>
                                                                )}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        <div style={{ marginTop: '30px', padding: '20px', background: '#f0f0f0', borderRadius: '8px', textAlign: 'center' }}>
                            <h3 style={{ marginTop: 0 }}>Final Score</h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#27ae60', margin: '10px 0' }}>
                                {data.totalScore}/100
                            </p>
                            <p style={{ color: '#666' }}>
                                {data.totalScore && data.totalScore >= 70 ? '🎉 Great job!' : 'Keep practicing!'}
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AssignmentResults;
