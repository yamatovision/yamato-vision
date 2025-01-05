import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testPeerSubmissions() {
  const courseId = 'cm5gq9rpm0002t0rdzk65kc2y';
  const chapterId = 'cm556rgwp0007mc9wz7xgytnc';
  const userId = 'cm4xhbr08000004ygffr4uy7t'; // 現在のユーザーID

  console.log('\nTesting Peer Submissions Fetch\n');

  try {
    // 1. チャプターの確認
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        course: true,
        task: true
      }
    });

    console.log('Chapter details:', {
      id: chapter?.id,
      courseId: chapter?.courseId,
      taskId: chapter?.taskId,
      courseTitle: chapter?.course?.title
    });

    if (!chapter) {
      console.log('Chapter not found');
      return;
    }

    if (!chapter.taskId) {
      console.log('No task associated with this chapter');
      return;
    }

    // 2. 提出物の確認
    const submissions = await prisma.submission.findMany({
      where: {
        taskId: chapter.taskId,
        userId: {
          not: userId
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            rank: true
          }
        }
      },
      orderBy: [
        { points: 'desc' },
        { submittedAt: 'desc' }
      ]
    });

    console.log('\nSubmissions found:', submissions.length);
    submissions.forEach((sub, index) => {
      console.log(`\nSubmission ${index + 1}:`, {
        id: sub.id,
        userName: sub.user.name,
        points: sub.points,
        submittedAt: sub.submittedAt
      });
    });

    // 3. データベースの接続状態確認
    const dbTest = await prisma.$queryRaw`SELECT 1 as connection_test`;
    console.log('\nDatabase connection test:', dbTest);

  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPeerSubmissions()
  .catch(console.error);